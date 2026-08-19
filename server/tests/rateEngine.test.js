/**
 * Unit tests for the rate calculation engine (pure math functions).
 * These tests use no database — they test computeVolumetricWeight,
 * computeChargeableWeight, and applyCodSurcharge in isolation.
 */

const {
  computeVolumetricWeight,
  computeChargeableWeight,
  applyCodSurcharge,
} = require('../src/utils/rateFormulas');

// ─── computeVolumetricWeight ──────────────────────────────────────────────────

describe('computeVolumetricWeight', () => {
  test('standard parcel: 10cm x 10cm x 10cm = 0.2 kg', () => {
    expect(computeVolumetricWeight(10, 10, 10)).toBeCloseTo(0.2);
  });

  test('large box: 50cm x 40cm x 30cm = 12 kg', () => {
    expect(computeVolumetricWeight(50, 40, 30)).toBeCloseTo(12);
  });

  test('flat envelope: 30cm x 20cm x 1cm = 0.12 kg', () => {
    expect(computeVolumetricWeight(30, 20, 1)).toBeCloseTo(0.12);
  });

  test('exactly the volumetric divisor: 5000cm^3 = 1 kg', () => {
    // 50 * 10 * 10 = 5000 / 5000 = 1
    expect(computeVolumetricWeight(50, 10, 10)).toBeCloseTo(1);
  });
});

// ─── computeChargeableWeight ──────────────────────────────────────────────────

describe('computeChargeableWeight', () => {
  test('actual weight is heavier — use actual', () => {
    expect(computeChargeableWeight(5, 2)).toBe(5);
  });

  test('volumetric weight is heavier — use volumetric', () => {
    expect(computeChargeableWeight(1, 12)).toBe(12);
  });

  test('equal weights — returns either (same value)', () => {
    expect(computeChargeableWeight(3, 3)).toBe(3);
  });
});

// ─── applyCodSurcharge ────────────────────────────────────────────────────────

describe('applyCodSurcharge', () => {
  test('flat surcharge of 50 returns 50 regardless of base charge', () => {
    const rule = { surchargeType: 'flat', value: 50 };
    expect(applyCodSurcharge(rule, 200)).toBeCloseTo(50);
  });

  test('percentage surcharge of 2% on base charge 500 = 10', () => {
    const rule = { surchargeType: 'percent', value: 2 };
    expect(applyCodSurcharge(rule, 500)).toBeCloseTo(10);
  });

  test('percentage surcharge of 1.5% on base charge 1000 = 15', () => {
    const rule = { surchargeType: 'percent', value: 1.5 };
    expect(applyCodSurcharge(rule, 1000)).toBeCloseTo(15);
  });

  test('null rule returns 0', () => {
    expect(applyCodSurcharge(null, 300)).toBe(0);
  });

  test('unknown surchargeType returns 0', () => {
    const rule = { surchargeType: 'unknown', value: 100 };
    expect(applyCodSurcharge(rule, 300)).toBe(0);
  });
});

// ─── End-to-end math check (no DB) ───────────────────────────────────────────

describe('End-to-end rate formula (manual calculation)', () => {
  test('B2C intra-zone, 5kg actual, big box, COD 2%', () => {
    // dimensions: 40cm x 30cm x 20cm
    const vol = computeVolumetricWeight(40, 30, 20); // = 4.8 kg
    expect(vol).toBeCloseTo(4.8);

    const chargeable = computeChargeableWeight(5, vol); // max(5, 4.8) = 5
    expect(chargeable).toBe(5);

    // Rate card: base=50, perKg=10
    const baseCharge = 50 + 5 * 10; // = 100
    expect(baseCharge).toBe(100);

    // COD 2%
    const codSurcharge = applyCodSurcharge({ surchargeType: 'percent', value: 2 }, baseCharge);
    expect(codSurcharge).toBeCloseTo(2);

    const total = baseCharge + codSurcharge;
    expect(total).toBeCloseTo(102);
  });

  test('B2B inter-zone, volumetric heavier, flat COD 75', () => {
    // dimensions: 60cm x 50cm x 40cm
    const vol = computeVolumetricWeight(60, 50, 40); // = 24 kg
    expect(vol).toBeCloseTo(24);

    const chargeable = computeChargeableWeight(10, vol); // max(10, 24) = 24
    expect(chargeable).toBe(24);

    // Rate card: base=100, perKg=15
    const baseCharge = 100 + 24 * 15; // = 460
    expect(baseCharge).toBe(460);

    const codSurcharge = applyCodSurcharge({ surchargeType: 'flat', value: 75 }, baseCharge);
    expect(codSurcharge).toBe(75);

    expect(baseCharge + codSurcharge).toBe(535);
  });
});
