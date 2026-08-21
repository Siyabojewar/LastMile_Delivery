# System Design Write-up — DeliverySync

## Rate Calculation Engine

The rate engine is a pure, admin-driven function with no hardcoded values. On order creation, the system computes volumetric weight as (L × B × H) / 5000 and compares it against the actual weight declared by the customer, billing on whichever is higher — this is standard courier-industry practice to account for bulky-but-light packages. The chargeable weight is then combined with the detected zone relationship (intra-zone or inter-zone) and the order type (B2B or B2C) to select the correct row from the `rate_cards` table, which stores a base rate plus a per-kg rate maintained entirely by the admin through CRUD endpoints. If the payment type is COD, a separate `cod_surcharge_rules` table (flat or percentage, per order type) is applied on top. The final charge is returned via a dedicated `/orders/quote` endpoint so the customer sees the exact total before confirming, decoupling "pricing" from "order creation" and letting the same engine be reused for quote previews, admin-created orders, and future rate simulations without duplicating logic.

## Zone Detection Approach

Rather than requiring full geofencing/polygon math for a first version, zone detection uses a `pincode_zone_map` lookup table: every serviceable pincode is mapped to exactly one zone, and admins manage this mapping alongside the zones themselves. On order creation, the pickup and drop pincodes are each resolved to a zone; if they match, the order is intra-zone, otherwise inter-zone. This keeps zone logic simple, fully data-driven, and trivially extendable later to true polygon/geo-boundary detection (using PostGIS or a lat/lng-in-polygon check) without changing the API contract — only the internal resolution function would change.

## Auto-Assignment Logic

Delivery agents carry an availability flag and a current zone (or last known lat/lng). Auto-assignment first looks for available agents whose current zone matches the order's drop zone; if none exist, it falls back to a radius search using the haversine formula against agent coordinates, expanding outward until a candidate is found. Among candidates, the nearest agent is chosen, with ties broken by whoever currently holds the fewest active orders — a simple load-balancing signal that avoids overloading one agent while others sit idle. Once assigned, the agent is marked unavailable for new auto-assignments until their current order reaches a terminal state (Delivered/Failed) or their concurrency limit allows another. Admins can always override this with a manual assignment endpoint, which is important for real-world exceptions (agent on leave, VIP customer, etc.) that a purely automated system can't anticipate.

## Order Status Lifecycle & Immutable Tracking

Every order carries a denormalized `status` field for fast filtering/display, but the actual source of truth is an append-only `order_status_history` table. Each transition (Picked Up → In Transit → Out for Delivery → Delivered, or → Failed) is inserted as a new row with the actor's user ID, role, and a timestamp — rows are never updated or deleted, which gives a legally/operationally defensible audit trail and lets the frontend render a full timeline for both customers and admins. Admin "override" of status is implemented as just another insert with `actor_role = admin`, keeping the history model uniform regardless of who changed it.

## Failed Delivery Handling

When an agent marks a delivery Failed, that transition is logged like any other and immediately triggers an email notification to the customer. The customer then calls a reschedule endpoint with a new date; this creates a row in `reschedule_requests` (capturing the old and new dates and who requested it), flips the order status to Rescheduled, and re-invokes the same auto-assignment routine used for fresh orders — so a failed delivery doesn't require special-cased assignment logic, just a re-entry point into the existing pipeline. From there the order re-enters the normal lifecycle starting at Picked Up for the new attempt. This design means failure handling adds exactly one new table and one new endpoint rather than branching the core status/assignment logic, keeping the system easier to reason about and test.

## Notifications

Every insert into `order_status_history` is treated as a domain event that triggers an email via Nodemailer, with the attempt (success or failure) logged in a `notifications_log` table for debuggability. SMS is wired through the same event hook but left stubbed/log-only, since free-tier SMS providers typically require phone verification — swapping in a real provider later is a config change, not a logic change.

---

*(≈ 640 words)*
