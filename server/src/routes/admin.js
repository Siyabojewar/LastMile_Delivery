const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

// ─── ZONES ────────────────────────────────────────────────────────────────────

// GET /api/v1/admin/zones
router.get('/zones', async (req, res, next) => {
  try {
    const zones = await prisma.zone.findMany({
      include: { pincodes: true },
      orderBy: { name: 'asc' },
    });
    res.json(zones);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/zones
router.post('/zones', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const zone = await prisma.zone.create({ data: { name, description } });
    res.status(201).json(zone);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Zone name already exists' });
    }
    next(err);
  }
});

// PUT /api/v1/admin/zones/:id
router.put('/zones/:id', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const zone = await prisma.zone.update({
      where: { id: req.params.id },
      data: { name, description },
    });
    res.json(zone);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Zone not found' });
    next(err);
  }
});

// ─── PINCODE ZONE MAP ─────────────────────────────────────────────────────────

// POST /api/v1/admin/pincode-map
router.post('/pincode-map', async (req, res, next) => {
  try {
    const { pincode, zoneId } = req.body;
    if (!pincode || !zoneId) return res.status(400).json({ error: 'pincode and zoneId are required' });

    // Upsert: if pincode already mapped, reassign it
    const mapping = await prisma.pincodeZoneMap.upsert({
      where: { pincode },
      update: { zoneId },
      create: { pincode, zoneId },
      include: { zone: true },
    });
    res.status(201).json(mapping);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/pincode-map
router.get('/pincode-map', async (req, res, next) => {
  try {
    const mappings = await prisma.pincodeZoneMap.findMany({
      include: { zone: true },
      orderBy: { pincode: 'asc' },
    });
    res.json(mappings);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/admin/pincode-map/:pincode
router.delete('/pincode-map/:pincode', async (req, res, next) => {
  try {
    await prisma.pincodeZoneMap.delete({ where: { pincode: req.params.pincode } });
    res.json({ message: 'Pincode mapping removed' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Pincode mapping not found' });
    next(err);
  }
});

// ─── RATE CARDS ───────────────────────────────────────────────────────────────

// GET /api/v1/admin/rate-cards
router.get('/rate-cards', async (req, res, next) => {
  try {
    const cards = await prisma.rateCard.findMany({ orderBy: { effectiveFrom: 'desc' } });
    res.json(cards);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/rate-cards
router.post('/rate-cards', async (req, res, next) => {
  try {
    const { orderType, zoneRelation, baseRate, ratePerKg, effectiveFrom, isActive } = req.body;
    if (!orderType || !zoneRelation || baseRate == null || ratePerKg == null) {
      return res.status(400).json({ error: 'orderType, zoneRelation, baseRate, ratePerKg are required' });
    }
    const card = await prisma.rateCard.create({
      data: {
        orderType,
        zoneRelation,
        baseRate: parseFloat(baseRate),
        ratePerKg: parseFloat(ratePerKg),
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : undefined,
        isActive: isActive !== undefined ? isActive : true,
      },
    });
    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/admin/rate-cards/:id
router.put('/rate-cards/:id', async (req, res, next) => {
  try {
    const { baseRate, ratePerKg, isActive, effectiveFrom } = req.body;
    const card = await prisma.rateCard.update({
      where: { id: req.params.id },
      data: {
        ...(baseRate != null && { baseRate: parseFloat(baseRate) }),
        ...(ratePerKg != null && { ratePerKg: parseFloat(ratePerKg) }),
        ...(isActive !== undefined && { isActive }),
        ...(effectiveFrom && { effectiveFrom: new Date(effectiveFrom) }),
      },
    });
    res.json(card);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Rate card not found' });
    next(err);
  }
});

// ─── COD SURCHARGE RULES ──────────────────────────────────────────────────────

// GET /api/v1/admin/cod-rules
router.get('/cod-rules', async (req, res, next) => {
  try {
    const rules = await prisma.codSurchargeRule.findMany();
    res.json(rules);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/cod-rules
router.post('/cod-rules', async (req, res, next) => {
  try {
    const { orderType, surchargeType, value, isActive } = req.body;
    if (!orderType || !surchargeType || value == null) {
      return res.status(400).json({ error: 'orderType, surchargeType, value are required' });
    }
    const rule = await prisma.codSurchargeRule.create({
      data: {
        orderType,
        surchargeType,
        value: parseFloat(value),
        isActive: isActive !== undefined ? isActive : true,
      },
    });
    res.status(201).json(rule);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/admin/cod-rules/:id
router.put('/cod-rules/:id', async (req, res, next) => {
  try {
    const { surchargeType, value, isActive } = req.body;
    const rule = await prisma.codSurchargeRule.update({
      where: { id: req.params.id },
      data: {
        ...(surchargeType && { surchargeType }),
        ...(value != null && { value: parseFloat(value) }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json(rule);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'COD rule not found' });
    next(err);
  }
});

// ─── AGENT MANAGEMENT ─────────────────────────────────────────────────────────

// GET /api/v1/admin/agents
router.get('/agents', async (req, res, next) => {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
        currentZone: true,
      },
    });
    res.json(agents);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/agents — create agent user + agent profile
router.post('/agents', async (req, res, next) => {
  try {
    const { name, email, password, phone, currentZoneId, currentLat, currentLng } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, passwordHash, role: 'agent', phone },
        select: { id: true, name: true, email: true, role: true, phone: true },
      });
      const agent = await tx.agent.create({
        data: {
          userId: user.id,
          currentZoneId: currentZoneId || null,
          isAvailable: true,
          currentLat: currentLat ? parseFloat(currentLat) : null,
          currentLng: currentLng ? parseFloat(currentLng) : null,
        },
      });
      return { user, agent };
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/admin/agents/:userId — update agent location / zone / availability
router.put('/agents/:userId', async (req, res, next) => {
  try {
    const { currentZoneId, isAvailable, currentLat, currentLng } = req.body;
    const agent = await prisma.agent.update({
      where: { userId: req.params.userId },
      data: {
        ...(currentZoneId !== undefined && { currentZoneId }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(currentLat != null && { currentLat: parseFloat(currentLat) }),
        ...(currentLng != null && { currentLng: parseFloat(currentLng) }),
        lastLocationUpdate: new Date(),
      },
    });
    res.json(agent);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Agent not found' });
    next(err);
  }
});

// ─── ALL ORDERS (admin view) ───────────────────────────────────────────────────

// GET /api/v1/admin/orders?status=&zoneId=&agentId=&page=&limit=
router.get('/orders', async (req, res, next) => {
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
          rateCard: true,
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

// POST /api/v1/admin/users/:id/reset-password — admin sets a new password for any user
router.post('/users/:id/reset-password', async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: req.params.id }, data: { passwordHash } });

    console.log(`[Admin] Password reset for user ${user.email} by admin ${req.user.email}`);
    res.json({ message: `Password updated for ${user.email}` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
