# Last-Mile Delivery Tracker

A full-stack delivery management system with role-based access for **customers**, **delivery agents**, and **admins**. Built with React (Vite) + Tailwind CSS, Node.js + Express, PostgreSQL + Prisma, and JWT authentication.

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- PostgreSQL (local or hosted, e.g. Render / Neon / Supabase)
- Git

---

### 1. Clone & Install

```bash
git clone https://github.com/Siyabojewar/LastMile_Delivery.git
cd LastMile_Delivery

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

---

### 2. Configure Environment

```bash
# In the server/ directory
cp .env.example .env
```

Edit `server/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/lastmile_db"
JWT_SECRET="your_long_random_secret_here"
JWT_EXPIRES_IN="7d"
PORT=4000
CLIENT_URL="http://localhost:5173"

# Email (Mailtrap for dev, Gmail App Password for prod)
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your_mailtrap_user"
SMTP_PASS="your_mailtrap_pass"
SMTP_FROM="noreply@lastmiledelivery.com"

AUTO_ASSIGN_RADIUS_KM=50
AGENT_CONCURRENT_ORDERS=1
```

---

### 3. Run Prisma Migrations

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

This creates all tables defined in `server/prisma/schema.prisma`.

---

### 4. Seed an Admin User

Prisma does not auto-seed. Run this one-time script to create your admin account:

```bash
cd server
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();
(async () => {
  const hash = await bcrypt.hash('admin123', 10);
  const u = await p.user.create({ data: { name: 'Admin', email: 'admin@example.com', passwordHash: hash, role: 'admin' }});
  console.log('Admin created:', u.email);
  await p.\$disconnect();
})();
"
```

---

### 5. Start the Servers

**Terminal 1 — API:**

```bash
cd server
npm run dev
# Listening on http://localhost:4000
```

**Terminal 2 — Frontend:**

```bash
cd client
npm run dev
# Available at http://localhost:5173
```

Open http://localhost:5173 and sign in with `admin@example.com` / `admin123`.

---

## Project Structure

```
LastMile_Delivery/
├── SPEC.md                      # Full technical specification
├── SYSTEM_DESIGN.md             # System design write-up (≤800 words)
├── README.md
├── server/
│   ├── prisma/
│   │   └── schema.prisma        # All DB models
│   ├── src/
│   │   ├── index.js             # Entry point
│   │   ├── app.js               # Express app setup
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT verify + RBAC authorize()
│   │   ├── routes/
│   │   │   ├── auth.js          # POST /auth/register, /auth/login
│   │   │   ├── admin.js         # Admin CRUD: zones, pincodes, rate cards, COD, agents
│   │   │   └── orders.js        # All order flows: quote, create, assign, status, reschedule
│   │   ├── services/
│   │   │   ├── rateEngine.js    # Rate calculation (DB-driven, no hardcoded values)
│   │   │   ├── assignment.js    # Auto & manual agent assignment
│   │   │   └── notifications.js # Nodemailer email + SMS stub + notifications_log
│   │   └── utils/
│   │       ├── prisma.js        # Singleton PrismaClient
│   │       └── rateFormulas.js  # Pure math functions (also used by unit tests)
│   ├── tests/
│   │   └── rateEngine.test.js   # 14 unit tests for rate formula logic
│   └── .env.example
└── client/
    └── src/
        ├── pages/
        │   ├── Login.jsx / Register.jsx
        │   ├── customer/        # CustomerOrders, NewOrder, TrackOrder
        │   ├── agent/           # AgentOrders, AgentOrderDetail
        │   └── admin/           # AdminOrders, AdminOrderDetail, AdminZones, AdminRateCards, AdminAgents
        ├── components/shared/   # Navbar, StatusBadge, Alert, LoadingSpinner
        ├── context/AuthContext.jsx
        └── utils/api.js         # Centralized fetch wrapper
```

---

## Running Tests

```bash
cd server
npm test
```

14 unit tests cover:

- `computeVolumetricWeight`: standard box, flat envelope, exact 1 kg divisor
- `computeChargeableWeight`: actual heavier, volumetric heavier, equal
- `applyCodSurcharge`: flat, percentage, null rule, unknown type
- End-to-end manual formula checks for B2C intra-zone COD and B2B inter-zone flat COD

---

## API Reference

### Base URL: `http://localhost:4000/api/v1`

All protected routes require: `Authorization: Bearer <token>`

#### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | None | Register customer |
| POST | `/auth/login` | None | Login any role, returns JWT |

#### Orders

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/orders/quote` | customer, admin | Compute charge without creating order |
| POST | `/orders` | customer, admin | Create order (uses same rate engine) |
| GET | `/orders/mine` | customer | Customer's own orders |
| GET | `/orders/assigned` | agent | Agent's assigned orders |
| GET | `/orders` | admin | All orders (filterable: `?status=&zoneId=&agentId=&page=&limit=`) |
| GET | `/orders/:id` | all | Single order + history (RBAC enforced) |
| GET | `/orders/:id/history` | all | Immutable status timeline |
| POST | `/orders/:id/status` | agent, admin | Update status (append-only history) |
| POST | `/orders/:id/assign` | admin | Manual agent assignment |
| POST | `/orders/:id/auto-assign` | admin | Auto-assign nearest available agent |
| POST | `/orders/:id/reschedule` | customer, admin | Reschedule failed delivery |

#### Admin — Zones, Rates, COD, Agents

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/admin/zones` | List / create zones |
| PUT | `/admin/zones/:id` | Update zone |
| GET/POST | `/admin/pincode-map` | List / create pincode→zone mappings |
| DELETE | `/admin/pincode-map/:pincode` | Remove mapping |
| GET/POST | `/admin/rate-cards` | List / create rate cards |
| PUT | `/admin/rate-cards/:id` | Update rate card |
| GET/POST | `/admin/cod-rules` | List / create COD surcharge rules |
| PUT | `/admin/cod-rules/:id` | Update COD rule |
| GET/POST | `/admin/agents` | List / create agent accounts |
| PUT | `/admin/agents/:userId` | Update agent zone/availability/location |
| GET | `/admin/orders` | All orders with full filter support |

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | All roles: admin, customer, agent |
| `zones` | Delivery zones (admin-managed) |
| `pincode_zone_map` | Maps each serviceable pincode → zone |
| `rate_cards` | Base + per-kg rates per order type & zone relation |
| `cod_surcharge_rules` | Flat or percentage COD surcharge per order type |
| `agents` | Agent profile extending users (zone, availability, lat/lng) |
| `orders` | Full order record with denormalized latest status |
| `order_status_history` | **Append-only** audit trail — never updated or deleted |
| `reschedule_requests` | Records every reschedule with old/new dates |
| `notifications_log` | Logs every email/SMS attempt per order |

See `server/prisma/schema.prisma` for the complete Prisma schema with all field types, constraints, and relations.

---

## Rate Calculation Logic

```
volumetric_weight_kg = (length_cm × breadth_cm × height_cm) / 5000
chargeable_weight_kg = max(actual_weight_kg, volumetric_weight_kg)

pickup_zone = pincode_zone_map[pickup_pincode]
drop_zone   = pincode_zone_map[drop_pincode]
zone_relation = (pickup_zone == drop_zone) ? "intra" : "inter"

rate_card = most recent active row WHERE order_type = ? AND zone_relation = ?
base_charge = rate_card.base_rate + (chargeable_weight_kg × rate_card.rate_per_kg)

cod_surcharge = 0
if payment_type == "COD":
  rule = active cod_surcharge_rules row WHERE order_type = ?
  if rule.type == "flat":    cod_surcharge = rule.value
  if rule.type == "percent": cod_surcharge = (rule.value / 100) × base_charge

total_charge = base_charge + cod_surcharge
```

**All values come from the database** — no rates are hardcoded. Admins control everything through the rate card and COD rule CRUD endpoints.

---

## Implementation Notes

- **Admin account**: must be seeded manually (see step 4 above) — the register endpoint only creates customer accounts.
- **Agent assignment capacity**: controlled by `AGENT_CONCURRENT_ORDERS` env var (default: 1). Set to a higher number to allow an agent to hold multiple active orders simultaneously.
- **SMS notifications**: stubbed as a `console.log` call in `notifications.js`. Wire a provider like Twilio by replacing the `stubSms` function — no other code change needed.
- **Zone detection**: uses pincode lookup table (`pincode_zone_map`). Admins add serviceable pincodes via the admin UI. Pincodes not in the table return a 422 error on quote/create.
- **Reschedule auto-assign**: after a customer reschedules, the system tries auto-assignment immediately. If no agent is available, the order stays `Rescheduled` and an admin can manually assign.
- **order_status_history immutability**: rows are insert-only at the database level via Prisma — there are no update or delete operations on that table anywhere in the codebase.
