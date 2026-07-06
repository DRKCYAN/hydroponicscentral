/**
 * Recipe validation bundled with the solver.
 * [II-4.4] cation–anion (ion) balance, [II-4.5] EC estimate from composition.
 */
import { MOLAR_MASS } from "./constants";

/** A charged species: elemental symbol for molar mass + its ionic charge. */
interface Species {
  element: string; // key into MOLAR_MASS
  charge: number;
}

/** Ion definitions used for the balance (N modeled as NO3⁻, P as H2PO4⁻, S as SO4²⁻). */
const CATIONS: Record<string, Species> = {
  Ca: { element: "Ca", charge: 2 },
  Mg: { element: "Mg", charge: 2 },
  K: { element: "K", charge: 1 },
  NH4: { element: "N", charge: 1 },
  Na: { element: "Na", charge: 1 },
};
const ANIONS: Record<string, Species> = {
  NO3: { element: "N", charge: 1 },
  H2PO4: { element: "P", charge: 1 },
  SO4: { element: "S", charge: 2 },
  Cl: { element: "Cl", charge: 1 },
  HCO3: { element: "C", charge: 1 }, // alkalinity carbon proxy
};

function ppmToMeq(ppm: number, element: string, charge: number): number {
  const m = MOLAR_MASS[element];
  if (!m) return 0;
  return (ppm / m) * Math.abs(charge);
}

export interface IonBalanceInput {
  /** ppm by species key. N may be split as NO3 (+ optional NH4). */
  ppm: Partial<Record<keyof typeof CATIONS | keyof typeof ANIONS, number>>;
}

export interface IonBalanceResult {
  sumCationsMeq: number;
  sumAnionsMeq: number;
  /** signed: + = cation excess (short on anions), − = anion excess. */
  imbalanceSignedPct: number;
  imbalanceMagnitudePct: number;
  /** true when magnitude within the pass tolerance. */
  balanced: boolean;
  direction: "cation-excess" | "anion-excess" | "balanced";
}

/**
 * [II-4.4] Compute cation/anion sums in meq/L and the signed + magnitude
 * imbalance. Aim within ±5–10%. The sign is DIRECTIONAL, not an error — label it.
 */
export function ionBalance(input: IonBalanceInput, tolerancePct = 10): IonBalanceResult {
  let cat = 0;
  for (const [key, sp] of Object.entries(CATIONS)) {
    cat += ppmToMeq(input.ppm[key as keyof typeof CATIONS] ?? 0, sp.element, sp.charge);
  }
  let an = 0;
  for (const [key, sp] of Object.entries(ANIONS)) {
    an += ppmToMeq(input.ppm[key as keyof typeof ANIONS] ?? 0, sp.element, sp.charge);
  }
  const avg = (cat + an) / 2 || 1;
  const signed = ((cat - an) / avg) * 100;
  const magnitude = Math.abs(signed);
  return {
    sumCationsMeq: cat,
    sumAnionsMeq: an,
    imbalanceSignedPct: signed,
    imbalanceMagnitudePct: magnitude,
    balanced: magnitude <= tolerancePct,
    direction: magnitude <= 1e-6 ? "balanced" : signed > 0 ? "cation-excess" : "anion-excess",
  };
}

/**
 * Build the ion-balance ppm map from macro elemental targets. N is split into
 * NO3/NH4 by `nh4Fraction` (0–1). A pragmatic mapping for the skeleton.
 */
export function ppmMapFromElements(
  el: Partial<Record<"N" | "P" | "K" | "Ca" | "Mg" | "S" | "Na" | "Cl", number>>,
  nh4Fraction = 0,
): IonBalanceInput["ppm"] {
  const n = el.N ?? 0;
  return {
    Ca: el.Ca ?? 0,
    Mg: el.Mg ?? 0,
    K: el.K ?? 0,
    Na: el.Na ?? 0,
    NH4: n * nh4Fraction,
    NO3: n * (1 - nh4Fraction),
    H2PO4: el.P ?? 0,
    SO4: el.S ?? 0,
    Cl: el.Cl ?? 0,
  };
}

/**
 * [II-4.5] Estimate EC (dS/m = mS/cm) from Σ cations (meq/L).
 * Empirical ~0.09–0.11; treat as ±10–15%. Never present as exact.
 */
export function ecFromCations(sumCationsMeq: number, factor = 0.095): number {
  return factor * sumCationsMeq;
}
