/**
 * Shared Foundations — constants & reference tables.
 * Canonical IDs: [II-9.1] molar masses, [II-9.2] oxide factors,
 * [II-9.4] ion charges, [II-9.5] EC scales, [IV-9.2/9.3] air & CO2 constants.
 *
 * One source of truth: every page references these rather than carrying a copy,
 * so the numbers cannot drift apart.
 */

/** [II-9.1] Atomic / molar masses (g/mol). */
export const MOLAR_MASS: Record<string, number> = {
  H: 1.008,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  Na: 22.99,
  Mg: 24.305,
  P: 30.974,
  S: 32.06,
  Cl: 35.45,
  K: 39.098,
  Ca: 40.078,
  Mn: 54.938,
  Fe: 55.845,
  Cu: 63.546,
  Zn: 65.38,
  B: 10.811,
  Mo: 95.95,
};

/** [II-9.2] Oxide -> elemental factors. Invert for elemental -> oxide. */
export const OXIDE_TO_ELEMENTAL = {
  P2O5_to_P: 0.4364,
  K2O_to_K: 0.8301,
  CaO_to_Ca: 0.7147,
  MgO_to_Mg: 0.6032,
  SO3_to_S: 0.4005,
} as const;

/** [II-9.4] Ion charge (valence) magnitudes for meq/L. */
export const ION_CHARGE: Record<string, number> = {
  // cations
  Ca: 2,
  Mg: 2,
  K: 1,
  NH4: 1,
  Na: 1,
  // anions
  NO3: 1,
  H2PO4: 1,
  SO4: 2,
  Cl: 1,
  HCO3: 1,
  CO3: 2,
};

/** Which elemental symbol a charged ion carries (for ppm->meq of an element). */
export const ELEMENT_VALENCE: Record<string, number> = {
  Ca: 2,
  Mg: 2,
  K: 1,
  Na: 1,
  N: 1, // as NO3-/NH4+ (monovalent) — approximation used for balance display
  P: 1, // as H2PO4-
  S: 2, // as SO4(2-)
  Cl: 1,
  Fe: 2,
};

/** [II-9.5] EC scale factors (ppm = EC(mS/cm) x K_scale). */
export const EC_SCALE = {
  ppm500: 500, // NaCl / TDS, Hanna-style
  eu640: 640, // European standard
  ppm700: 700, // KCl, Truncheon-style
} as const;
export type EcScale = keyof typeof EC_SCALE;

/** Equivalent weight of CaCO3 (g/eq) — alkalinity/hardness. */
export const CACO3_EQ_WEIGHT = 50.04;

/** EC temperature coefficient (per °C), ~2%/°C. [II-1.2] */
export const EC_TEMP_ALPHA = 0.02;

/** Physical constants used by the engine. */
export const CONST = {
  g: 9.81, // m/s^2
  cpWater: 4186, // J/(kg·K)
  cpAir: 1006, // J/(kg·K)  [IV-9.2]
  cpVapor: 1860, // J/(kg·K)
  latentHeatVap: 2_450_000, // J/kg at ~20°C
  rhoWater: 1000, // kg/m^3
  o2PerLiterAir: 280, // mg O2 per L air (~21% O2)
  cdOrifice: 0.6, // sharp orifice discharge coefficient
  Patm: 101.325, // kPa, standard atmosphere
  mWaterOverMdryAir: 0.622,
  Rdry: 287.05, // J/(kg·K)
  Rvapor: 461.5, // J/(kg·K)
  co2MolarMass: 44.01, // g/mol
  co2Density: 1830, // g/m^3 at 20°C, 1 atm
} as const;

/** [IV-9.5] Setpoint rules of thumb — defaults, store as tunable. */
export const VPD_TARGETS = {
  propagation: [0.4, 0.8],
  vegetative: [0.8, 1.2],
  flowering: [1.2, 1.5],
} as const;
