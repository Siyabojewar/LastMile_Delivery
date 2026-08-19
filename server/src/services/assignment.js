const prisma = require('../utils/prisma');

/**
 * Haversine formula — returns distance in kilometres between two lat/lng points.
 */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Auto-assign the nearest available agent to an order.
 *
 * Strategy (per SPEC section 6):
 *  1. Prefer agents whose current_zone_id === order.drop_zone_id
 *  2. Fall back to haversine search within RADIUS_KM (env or default 50)
 *  3. Tie-break: fewest active (non-terminal) orders
 *
 * @param {string} orderId
 * @param {object} dropZone - { id }
 * @param {number|null} dropLat - optional, for haversine fallback
 * @param {number|null} dropLng - optional, for haversine fallback
 * @returns {Promise<object>} updated order
 */
async function autoAssign(orderId, dropZone, dropLat = null, dropLng = null) {
  const RADIUS_KM = parseFloat(process.env.AUTO_ASSIGN_RADIUS_KM || '50');

  // Fetch all available agents with their active order counts
  const availableAgents = await prisma.agent.findMany({
    where: { isAvailable: true },
    include: {
      user: { select: { id: true, name: true } },
      currentZone: true,
    },
  });

  if (availableAgents.length === 0) {
    throw Object.assign(new Error('No available agents at this time'), { status: 422 });
  }

  // Get active order counts for available agents
  const agentIds = availableAgents.map((a) => a.userId);
  const activeOrderCounts = await prisma.order.groupBy({
    by: ['assignedAgentId'],
    where: {
      assignedAgentId: { in: agentIds },
      status: { notIn: ['Delivered', 'Failed'] },
    },
    _count: { id: true },
  });

  const countMap = {};
  activeOrderCounts.forEach((r) => {
    countMap[r.assignedAgentId] = r._count.id;
  });

  // Scoring: compute distances and zone match
  const scored = availableAgents
    .map((agent) => {
      const inZone = agent.currentZoneId === dropZone.id;
      let distKm = Infinity;

      if (
        agent.currentLat != null &&
        agent.currentLng != null &&
        dropLat != null &&
        dropLng != null
      ) {
        distKm = haversineKm(
          parseFloat(agent.currentLat),
          parseFloat(agent.currentLng),
          parseFloat(dropLat),
          parseFloat(dropLng)
        );
      } else if (inZone) {
        distKm = 0; // treat same zone with no coords as distance 0
      }

      return {
        agent,
        inZone,
        distKm,
        activeOrders: countMap[agent.userId] || 0,
      };
    })
    .filter((s) => {
      // Must be in-zone OR within radius (if coords available)
      if (s.inZone) return true;
      if (dropLat != null && dropLng != null && s.distKm <= RADIUS_KM) return true;
      return false;
    });

  if (scored.length === 0) {
    throw Object.assign(
      new Error('No available agents in the drop zone or within radius'),
      { status: 422 }
    );
  }

  // Sort: inZone first, then distance, then fewest active orders
  scored.sort((a, b) => {
    if (a.inZone !== b.inZone) return a.inZone ? -1 : 1;
    if (a.distKm !== b.distKm) return a.distKm - b.distKm;
    return a.activeOrders - b.activeOrders;
  });

  const chosen = scored[0].agent;

  // Assign in a transaction
  const updatedOrder = await prisma.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: { id: orderId },
      data: { assignedAgentId: chosen.userId },
      include: { customer: true },
    });

    // Mark agent unavailable (single-order capacity; change env AGENT_CONCURRENT_ORDERS > 1 to relax)
    const maxConcurrent = parseInt(process.env.AGENT_CONCURRENT_ORDERS || '1');
    const newCount = (countMap[chosen.userId] || 0) + 1;
    if (newCount >= maxConcurrent) {
      await tx.agent.update({
        where: { userId: chosen.userId },
        data: { isAvailable: false },
      });
    }

    return order;
  });

  return { order: updatedOrder, agent: chosen };
}

/**
 * Manual assignment — admin assigns a specific agent.
 */
async function manualAssign(orderId, agentId, actorId) {
  const agent = await prisma.agent.findUnique({ where: { userId: agentId } });
  if (!agent) throw Object.assign(new Error('Agent not found'), { status: 404 });

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { assignedAgentId: agentId },
  });

  return updatedOrder;
}

module.exports = { autoAssign, manualAssign, haversineKm };
