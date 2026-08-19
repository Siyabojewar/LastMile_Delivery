/**
 * Pure rate-calculation math functions — no database dependency.
 * Imported by rateEngine.js and by unit tests.
 */

/**
 * Compute volumetric weight using the standard courier divisor of 5000.
 * @param {number} l - length in cm
 * @param {number} b - breadth in cm
 * @param {number} h - height in cm
 * @returns {number} volumetric weight in kg
 */
function computeVolumetricWeight(l, b, h) {
  return (l * b * h) / 5000;
}

/**
 * Compute chargeable weight: higher of actual vs volumetric.
 * @param {number} actual
 * @param {number} volumetric
 * @returns {number}
 */
function computeChargeableWeight(actual, volumetric) {
  return Math.max(actual, volumetric);
}

/**
 * Apply a COD surcharge rule to the base charge.
 * @param {object|null} rule - { surchargeType: 'flat'|'percent', value: number }
 * @param {number} baseCharge
 * @returns {number} surcharge amount
 */
function applyCodSurcharge(rule, baseCharge) {
  if (!rule) return 0;
  if (rule.surchargeType === 'flat') return parseFloat(rule.value);
  if (rule.surchargeType === 'percent') return (parseFloat(rule.value) / 100) * baseCharge;
  return 0;
}

module.exports = { computeVolumetricWeight, computeChargeableWeight, applyCodSurcharge };
