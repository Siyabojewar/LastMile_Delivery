const prisma = require('../utils/prisma');
const { computeVolumetricWeight, computeChargeableWeight, applyCodSurcharge } = require('../utils/rateFormulas');

/**
 * Full rate calculation engine.
 * Looks up zones from pincodes, finds the matching active rate card,
 * applies COD surcharge if needed, and returns the full quote breakdown.
 *
 * @param {object} params
 * @param {string} params.pickupPincode
 * @param {string} params.dropPincode
 * @param {string} params.orderType - 'B2B' | 'B2C'
 * @param {string} params.paymentType - 'Prepaid' | 'COD'
 * @param {number} params.lengthCm
 * @param {number} params.breadthCm
 * @param {number} params.heightCm
 * @param {number} params.actualWeightKg
 * @returns {Promise<object>} quote breakdown
 */
async function calculateRate({ pickupPincode, dropPincode, orderType, paymentType, lengthCm, breadthCm, heightCm, actualWeightKg }) {
  // 1. Zone lookup
  const [pickupMap, dropMap] = await Promise.all([
    prisma.pincodeZoneMap.findUnique({ where: { pincode: pickupPincode }, include: { zone: true } }),
    prisma.pincodeZoneMap.findUnique({ where: { pincode: dropPincode }, include: { zone: true } }),
  ]);

  if (!pickupMap) throw Object.assign(new Error(`Pickup pincode ${pickupPincode} is not serviceable`), { status: 422 });
  if (!dropMap) throw Object.assign(new Error(`Drop pincode ${dropPincode} is not serviceable`), { status: 422 });

  const pickupZoneId = pickupMap.zoneId;
  const dropZoneId = dropMap.zoneId;
  const zoneRelation = pickupZoneId === dropZoneId ? 'intra' : 'inter';

  // 2. Weight computation
  const volumetricWeightKg = computeVolumetricWeight(
    parseFloat(lengthCm),
    parseFloat(breadthCm),
    parseFloat(heightCm)
  );
  const chargeableWeightKg = computeChargeableWeight(parseFloat(actualWeightKg), volumetricWeightKg);

  // 3. Rate card lookup — most recent active card matching criteria
  const rateCard = await prisma.rateCard.findFirst({
    where: { orderType, zoneRelation, isActive: true },
    orderBy: { effectiveFrom: 'desc' },
  });

  if (!rateCard) {
    throw Object.assign(
      new Error(`No active rate card found for orderType=${orderType}, zoneRelation=${zoneRelation}`),
      { status: 422 }
    );
  }

  // 4. Base charge = base_rate + (chargeable_weight * rate_per_kg)
  const baseCharge = parseFloat(rateCard.baseRate) + (chargeableWeightKg * parseFloat(rateCard.ratePerKg));

  // 5. COD surcharge (if applicable)
  let codSurchargeAmount = 0;
  if (paymentType === 'COD') {
    const codRule = await prisma.codSurchargeRule.findFirst({
      where: { orderType, isActive: true },
    });
    codSurchargeAmount = applyCodSurcharge(codRule, baseCharge);
  }

  // 6. Total
  const totalCharge = baseCharge + codSurchargeAmount;

  return {
    pickupZoneId,
    dropZoneId,
    pickupZone: pickupMap.zone,
    dropZone: dropMap.zone,
    zoneRelation,
    volumetricWeightKg: parseFloat(volumetricWeightKg.toFixed(3)),
    chargeableWeightKg: parseFloat(chargeableWeightKg.toFixed(3)),
    rateCard,
    baseCharge: parseFloat(baseCharge.toFixed(2)),
    codSurchargeAmount: parseFloat(codSurchargeAmount.toFixed(2)),
    totalCharge: parseFloat(totalCharge.toFixed(2)),
  };
}

module.exports = { calculateRate, computeVolumetricWeight, computeChargeableWeight, applyCodSurcharge };
