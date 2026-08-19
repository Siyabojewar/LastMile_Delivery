const express = require('express');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { calculateRate } = require('../services/rateEngine');
const { autoAssign, manualAssign } = require('../services/assignment');
const { sendStatusEmail } = require('../services/notifications');

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// ─── QUOTE (no order created) ─────────────────────────────────────────────────

// POST /api/v1/orders/quote
// Roles: customer, admin
router.post('/quote', authorize('customer', 'admin'), async (req, res, next) => {
  try {
    const {
      pickupPincode, dropPincode, orderType, paymentType,
      lengthCm, breadthCm, heightCm, actualWeightKg,
    } = req.body;

    const required = { pickupPincode, dropPincode, orderType, paymentType, lengthCm, breadthCm, heightCm, actualWeightKg };
    const missing = Object.entries(required).filter(([, v]) => v == null || v === '').map(([k]) => k);
    if (missing.length) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    const quote = await calculateRate({
      pickupPincode, dropPincode, orderType, paymentType,
      lengthCm: parseFloat(lengthCm),
      breadthCm: parseFloat(breadthCm),
      heightCm: parseFloat(heightCm),
      actualWeightKg: parseFloat(actualWeightKg),
    });

    res.json(quote);
  } catch (err) {
    next(err);
  }
});

// ─── CUSTOMER: OWN ORDERS ─────────────────────────────────────────────────────

// GET /api/v1/orders/mine
router.get('/mine', authorize('customer'), async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.user.id },
      include: {
        pickupZone: true,
        dropZone: true,
        assignedAgent: { select: { id: true, name: true, email: true, phone: true } },
        rateCard: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// ─── AGENT: ASSIGNED ORDERS ───────────────────────────────────────────────────

// GET /api/v1/orders/assigned
router.get('/assigned', authorize('agent'), async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { assignedAgentId: req.user.id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        pickupZone: true,
        dropZone: true,
        rateCard: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// ─── CREATE ORDER ─────────────────────────────────────────────────────────────

// POST /api/v1/orders
// customer creates for themselves; admin can specify customerId
router.post('/', authorize('customer', 'admin'), async (req, res, next) => {
  try {
    const {
      customerId,          // admin only: create on behalf
      pickupAddress, pickupPincode,
      dropAddress, dropPincode,
      lengthCm, breadthCm, heightCm, actualWeightKg,
      orderType, paymentType,
      scheduledDate,
    } = req.body;

    const effectiveCustomerId = req.user.role === 'admin' ? customerId : req.user.id;
    if (!effectiveCustomerId) {
      return res.status(400).json({ error: 'customerId is required for admin-created orders' });
    }

    const required = { pickupAddress, pickupPincode, dropAddress, dropPincode, lengthCm, breadthCm, heightCm, actualWeightKg, orderType, paymentType };
    const missing = Object.entries(required).filter(([, v]) => v == null || v === '').map(([k]) => k);
    if (missing.length) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    // Run rate engine
    const quote = await calculateRate({
      pickupPincode, dropPincode, orderType, paymentType,
      lengthCm: parseFloat(lengthCm),
      breadthCm: parseFloat(breadthCm),
      heightCm: parseFloat(heightCm),
      actualWeightKg: parseFloat(actualWeightKg),
    });

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerId: effectiveCustomerId,
          createdById: req.user.id,
          pickupAddress,
          pickupPincode,
          pickupZoneId: quote.pickupZoneId,
          dropAddress,
          dropPincode,
          dropZoneId: quote.dropZoneId,
          lengthCm: parseFloat(lengthCm),
          breadthCm: parseFloat(breadthCm),
          heightCm: parseFloat(heightCm),
          actualWeightKg: parseFloat(actualWeightKg),
          volumetricWeightKg: quote.volumetricWeightKg,
          chargeableWeightKg: quote.chargeableWeightKg,
          orderType,
          paymentType,
          rateCardId: quote.rateCard.id,
          baseCharge: quote.baseCharge,
          codSurchargeAmount: quote.codSurchargeAmount,
          totalCharge: quote.totalCharge,
          status: 'Created',
          scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        },
        include: { customer: true },
      });

      // Immutable history entry
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          status: 'Created',
          actorId: req.user.id,
          actorRole: req.user.role,
          note: 'Order created',
        },
      });

      return newOrder;
    });

    // Fire notification (non-blocking)
    sendStatusEmail(order, 'Created').catch(console.error);

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// ─── ADMIN: LIST / FILTER ALL ORDERS ─────────────────────────────────────────

// GET /api/v1/orders  (admin only; customers use /mine, agents use /assigned)
router.get('/', authorize('admin'), async (req, res, next) => {
  try {
    const { status, zoneId, agentId, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (zoneId) where.dropZoneId = zoneId;
    if (agentId) where.assignedAgentId = agentId;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true } },
          assignedAgent: { select: { id: true, name: true, email: true } },
          pickupZone: true,
          dropZone: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
});

// ─── GET SINGLE ORDER ─────────────────────────────────────────────────────────

// GET /api/v1/orders/:id
router.get('/:id', authorize('customer', 'agent', 'admin'), async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        assignedAgent: { select: { id: true, name: true, email: true, phone: true } },
        pickupZone: true,
        dropZone: true,
        rateCard: true,
        statusHistory: {
          include: { actor: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
        rescheduleRequests: {
          include: { requestedBy: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });

    // RBAC: customers can only see their own orders; agents only their assigned
    if (req.user.role === 'customer' && order.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (req.user.role === 'agent' && order.assignedAgentId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

// ─── STATUS HISTORY (tracking timeline) ──────────────────────────────────────

// GET /api/v1/orders/:id/history
router.get('/:id/history', authorize('customer', 'agent', 'admin'), async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (req.user.role === 'customer' && order.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (req.user.role === 'agent' && order.assignedAgentId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const history = await prisma.orderStatusHistory.findMany({
      where: { orderId: req.params.id },
      include: { actor: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });

    res.json(history);
  } catch (err) {
    next(err);
  }
});

// ─── UPDATE STATUS ────────────────────────────────────────────────────────────

// POST /api/v1/orders/:id/status
// agent (own assigned orders) or admin (any order)
router.post('/:id/status', authorize('agent', 'admin'), async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { customer: true },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (req.user.role === 'agent' && order.assignedAgentId !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own assigned orders' });
    }

    const VALID_STATUSES = ['Created', 'PickedUp', 'InTransit', 'OutForDelivery', 'Delivered', 'Failed', 'Rescheduled'];
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Append-only history insert
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status,
          actorId: req.user.id,
          actorRole: req.user.role,
          note: note || null,
        },
      });

      // Update denormalized status on order
      const updated = await tx.order.update({
        where: { id: order.id },
        data: { status },
        include: { customer: true },
      });

      // If delivered/failed, free up the agent
      if ((status === 'Delivered' || status === 'Failed') && order.assignedAgentId) {
        await tx.agent.update({
          where: { userId: order.assignedAgentId },
          data: { isAvailable: true },
        });
      }

      return updated;
    });

    // Fire email notification
    sendStatusEmail(updatedOrder, status).catch(console.error);

    res.json(updatedOrder);
  } catch (err) {
    next(err);
  }
});

// ─── MANUAL ASSIGNMENT ────────────────────────────────────────────────────────

// POST /api/v1/orders/:id/assign
router.post('/:id/assign', authorize('admin'), async (req, res, next) => {
  try {
    const { agentId } = req.body;
    if (!agentId) return res.status(400).json({ error: 'agentId is required' });

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: req.params.id },
        data: { assignedAgentId: agentId },
        include: { customer: true },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: updated.id,
          status: updated.status,
          actorId: req.user.id,
          actorRole: 'admin',
          note: `Manually assigned to agent ${agentId}`,
        },
      });

      return updated;
    });

    res.json(updatedOrder);
  } catch (err) {
    next(err);
  }
});

// ─── AUTO ASSIGNMENT ──────────────────────────────────────────────────────────

// POST /api/v1/orders/:id/auto-assign
router.post('/:id/auto-assign', authorize('admin'), async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { dropZone: true },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!order.dropZone) return res.status(422).json({ error: 'Order has no drop zone mapped' });

    const { order: updatedOrder, agent } = await autoAssign(
      order.id,
      order.dropZone,
      null,  // dropLat — could be enriched later
      null
    );

    await prisma.orderStatusHistory.create({
      data: {
        orderId: updatedOrder.id,
        status: updatedOrder.status,
        actorId: req.user.id,
        actorRole: 'admin',
        note: `Auto-assigned to agent ${agent.userId}`,
      },
    });

    res.json({ order: updatedOrder, assignedAgent: agent });
  } catch (err) {
    next(err);
  }
});

// ─── RESCHEDULE (failed delivery) ────────────────────────────────────────────

// POST /api/v1/orders/:id/reschedule
router.post('/:id/reschedule', authorize('customer', 'admin'), async (req, res, next) => {
  try {
    const { newDate } = req.body;
    if (!newDate) return res.status(400).json({ error: 'newDate is required' });

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { customer: true, dropZone: true },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (req.user.role === 'customer' && order.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (order.status !== 'Failed') {
      return res.status(422).json({ error: 'Only Failed orders can be rescheduled' });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Create reschedule request record
      await tx.rescheduleRequest.create({
        data: {
          orderId: order.id,
          oldScheduledDate: order.scheduledDate,
          newScheduledDate: new Date(newDate),
          requestedById: req.user.id,
        },
      });

      // Update order status + scheduled date
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'Rescheduled',
          scheduledDate: new Date(newDate),
          // Free up current agent so auto-assign can pick a fresh one
          assignedAgentId: null,
        },
        include: { customer: true },
      });

      // Append-only history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'Rescheduled',
          actorId: req.user.id,
          actorRole: req.user.role,
          note: `Rescheduled for ${newDate}`,
        },
      });

      // Free up the previously assigned agent if any
      if (order.assignedAgentId) {
        await tx.agent.update({
          where: { userId: order.assignedAgentId },
          data: { isAvailable: true },
        });
      }

      return updated;
    });

    // Trigger auto-assign for the rescheduled order
    if (order.dropZone) {
      try {
        const { agent } = await autoAssign(updatedOrder.id, order.dropZone);
        await prisma.$transaction(async (tx) => {
          await tx.rescheduleRequest.updateMany({
            where: { orderId: order.id },
            data: { reassignedAgentId: agent.userId },
          });
        });
      } catch (assignErr) {
        // Auto-assign can fail if no agent available; admin can manually assign
        console.warn('[Reschedule] Auto-assign failed:', assignErr.message);
      }
    }

    sendStatusEmail(updatedOrder, 'Rescheduled').catch(console.error);

    res.json(updatedOrder);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
