# DeliverySync — Technical Specification

Repo: https://github.com/Siyabojewar/LastMile_Delivery.git (branch: `main`, public)
Local path: `C:\Users\siyab\OneDrive\Desktop\LastMile_Delivery`

---

## 1. Tech Stack (fixed, minimal)

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js + Express (REST API)
- **Database:** PostgreSQL
- **ORM:** Prisma (schema + migrations)
- **Auth:** JWT, role-based (`admin`, `customer`, `agent`)
- **Notifications:** Nodemailer (free SMTP, e.g. Gmail/Mailtrap) for email; SMS optional/stubbed (log-only)
- **Hosting:** Render (backend + Postgres) / Vercel (frontend)
- Excluded from repo: `node_modules/`, `.env`, `dist/`, `.next/`, `.vscode/`, `.idea/`

---

## 2. Roles & Permissions

| Action                    | Customer | Agent           | Admin                  |
|---------------------------|----------|-----------------|------------------------|
| Register/login            | ✅       | ❌ (created by admin) | ❌ (seeded)        |
| Create order (self)       | ✅       | ❌              | ✅ (on behalf)         |
| View own orders           | ✅       | ✅ (assigned only) | ✅ (all)            |
| Update order status       | ❌       | ✅ (assigned only) | ✅ (override any)   |
| Manage zones/rate cards   | ❌       | ❌              | ✅                     |
| Assign/reassign agent     | ❌       | ❌              | ✅ (manual or auto)    |
| Reschedule failed delivery| ✅       | ❌              | ✅                     |

---

## 3. Database Schema

```
users
  id (PK), name, email (unique), password_hash, role (enum: admin|customer|agent),
  phone, created_at

zones
  id (PK), name, polygon_or_pincode_list (jsonb), created_at

pincode_zone_map
  pincode (PK), zone_id (FK -> zones)

rate_cards
  id (PK), order_type (enum: B2B|B2C), zone_relation (enum: intra|inter),
  base_rate, rate_per_kg, effective_from, is_active

cod_surcharge_rules
  id (PK), order_type (enum: B2B|B2C), surcharge_type (enum: flat|percent), value, is_active

agents (extends users where role=agent)
  user_id (PK/FK -> users), current_zone_id (FK -> zones), is_available (bool),
  current_lat, current_lng, last_location_update

orders
  id (PK), customer_id (FK -> users), created_by (FK -> users),
  pickup_address, pickup_pincode, pickup_zone_id (FK),
  drop_address, drop_pincode, drop_zone_id (FK),
  length_cm, breadth_cm, height_cm, actual_weight_kg, volumetric_weight_kg, chargeable_weight_kg,
  order_type (enum: B2B|B2C), payment_type (enum: Prepaid|COD),
  rate_card_id (FK), base_charge, cod_surcharge_amount, total_charge,
  status (enum: Created|PickedUp|InTransit|OutForDelivery|Delivered|Failed|Rescheduled),
  assigned_agent_id (FK -> users, nullable),
  scheduled_date, created_at, updated_at

order_status_history   -- immutable, append-only
  id (PK), order_id (FK), status, actor_id (FK -> users), actor_role,
  note, created_at   -- NEVER updated/deleted, only inserted

reschedule_requests
  id (PK), order_id (FK), old_scheduled_date, new_scheduled_date,
  requested_by (FK -> users), reassigned_agent_id (FK -> users), created_at

notifications_log
  id (PK), order_id (FK), channel (enum: email|sms), recipient, subject,
  status (sent|failed), sent_at
```

**Immutability rule:** `order_status_history` rows are insert-only. `orders.status` is a denormalized "latest" pointer; history table is the source of truth.

---

## 4. API Design (REST, `/api/v1`)

### Auth
- `POST /auth/register` (customer only)
- `POST /auth/login`

### Admin — Zones & Rates
- `POST /admin/zones`, `GET /admin/zones`, `PUT /admin/zones/:id`
- `POST /admin/pincode-map`
- `POST /admin/rate-cards`, `GET /admin/rate-cards`, `PUT /admin/rate-cards/:id`
- `POST /admin/cod-rules`, `PUT /admin/cod-rules/:id`
- `POST /admin/agents` (create agent account)

### Orders
- `POST /orders/quote` → runs rate engine, returns computed charge without creating the order
- `POST /orders` → creates order after quote confirmation
- `GET /orders/:id` → full details + tracking timeline
- `GET /orders?status=&zone=&agent=` → admin list/filter
- `GET /orders/mine` → customer's own orders
- `GET /orders/assigned` → agent's assigned orders

### Assignment
- `POST /orders/:id/assign` `{ agentId }` → manual assign (admin)
- `POST /orders/:id/auto-assign` → nearest available agent in drop zone (admin-triggered)

### Status / Tracking
- `POST /orders/:id/status` `{ status, note }` → agent/admin; appends to history, fires notification
- `GET /orders/:id/history` → full immutable timeline

### Reschedule (failed delivery)
- `POST /orders/:id/reschedule` `{ newDate }` → customer; sets status Rescheduled, triggers reassignment

---

## 5. Rate Calculation Engine

```
volumetric_weight = (L * B * H) / 5000
chargeable_weight = max(actual_weight, volumetric_weight)
pickup_zone = lookup(pincode_zone_map, pickup_pincode)
drop_zone   = lookup(pincode_zone_map, drop_pincode)
relation    = (pickup_zone == drop_zone) ? intra : inter
rate_card   = active rate_card WHERE order_type = order.order_type AND zone_relation = relation
base_charge = rate_card.base_rate + (chargeable_weight * rate_card.rate_per_kg)
cod_surcharge = payment_type == COD ? apply(cod_surcharge_rules for order_type) : 0
total_charge  = base_charge + cod_surcharge
```

All rate values come from DB (admin-editable) — nothing hardcoded in application code.

---

## 6. Auto-Assignment Logic

1. Filter `agents` where `is_available = true` AND `current_zone_id = order.drop_zone_id`.
2. If none in-zone, expand to agents whose `current_lat/lng` is within a configurable radius (haversine distance) of the drop location.
3. Pick nearest by distance; on tie, pick agent with fewest currently active orders.
4. On assignment: set `orders.assigned_agent_id`, set agent `is_available = false`, log to `order_status_history`.
5. Same routine reused for reassignment after a failed delivery.

---

## 7. Failed Delivery Flow

1. Agent sets status `Failed` → history logged, email sent to customer.
2. Customer calls `POST /orders/:id/reschedule` with a new date.
3. System creates `reschedule_requests` row, sets order status `Rescheduled`, runs auto-assignment.
4. Cycle re-enters normal status lifecycle from `PickedUp` onward.

---

## 8. Notifications

On every insert into `order_status_history`, trigger an email to the customer via Nodemailer with subject `Order #<id> — <status>`. Log every attempt in `notifications_log`. SMS hook stubbed behind the same event.

---

## 9. Deliverables Checklist

- [ ] Public GitHub repo, `main` branch, no `node_modules`/`.env`/build artifacts
- [ ] `README.md`: setup guide, `.env.example`, API docs, DB schema, rate-calc explanation
- [ ] System design write-up (≤800 words)
- [ ] Minimal, native dependencies only

---

## 10. Build Order

1. DB schema + migrations
2. Auth + RBAC middleware
3. Zones/rate-cards/COD admin CRUD
4. Rate engine (`/orders/quote`) + unit tests on the formula
5. Order creation + immutable status history
6. Assignment logic (manual + auto)
7. Failed delivery + reschedule flow
8. Email notifications
9. Frontend: customer flow, agent flow, admin dashboard
10. README + system design write-up
11. Deploy + push to `main`
