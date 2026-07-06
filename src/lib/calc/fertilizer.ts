/**
 * Fertilizer Library math — oxide->elemental label decoding [II-2.x], the
 * salt composition matrix [II-9.3], forward/inverse element contribution
 * [II-3.1/3.2], and chelated-Fe availability [II-7.2].
 *
 * ⚠ Store %element for the ACTUAL PRODUCT FORM the grower buys (hydrated salt),
 * not the anhydrous salt. See fertilizer preset data for hydration handling.
 */
import { OXIDE_TO_ELEMENTAL } from "./constants";

// ---- [II-2.x] Label decoding: guaranteed-analysis oxides -> elemental % ----
export const p2o5ToP = (v: number) => v * OXIDE_TO_ELEMENTAL.P2O5_to_P;
export const pToP2o5 = (v: number) => v / OXIDE_TO_ELEMENTAL.P2O5_to_P;
export const k2oToK = (v: number) => v * OXIDE_TO_ELEMENTAL.K2O_to_K;
export const kToK2o = (v: number) => v / OXIDE_TO_ELEMENTAL.K2O_to_K;
export const caoToCa = (v: number) => v * OXIDE_TO_ELEMENTAL.CaO_to_Ca;
export const mgoToMg = (v: number) => v * OXIDE_TO_ELEMENTAL.MgO_to_Mg;
export const so3ToS = (v: number) => v * OXIDE_TO_ELEMENTAL.SO3_to_S;

/**
 * Decode an N-P-K label (+ optional Ca/Mg/S as oxides) into elemental percents.
 * Guaranteed analysis reports P as P2O5 and K as K2O; convert before any ppm math.
 */
export interface LabelInput {
  N?: number; // already elemental on a label
  P2O5?: number;
  K2O?: number;
  CaO?: number;
  MgO?: number;
  SO3?: number;
  // pass-through elementals if the label already gives them
  S?: number;
  Ca?: number;
  Mg?: number;
}
export interface ElementalPercents {
  N: number;
  P: number;
  K: number;
  Ca: number;
  Mg: number;
  S: number;
}
export function decodeLabel(label: LabelInput): ElementalPercents {
  return {
    N: label.N ?? 0,
    P: label.P2O5 != null ? p2o5ToP(label.P2O5) : 0,
    K: label.K2O != null ? k2oToK(label.K2O) : 0,
    Ca: label.Ca ?? (label.CaO != null ? caoToCa(label.CaO) : 0),
    Mg: label.Mg ?? (label.MgO != null ? mgoToMg(label.MgO) : 0),
    S: label.S ?? (label.SO3 != null ? so3ToS(label.SO3) : 0),
  };
}

// ---- [II-3.1] Element contribution (forward) ----
/**
 * ppm of an element produced by dissolving `massG` grams of a fertilizer that is
 * `percentElement`% (elemental) of that element in `volumeL` liters.
 * Derivation: g x (%/100) x 1000 / L  =>  combined constant x10.
 */
export function elementContributionPpm(
  massG: number,
  percentElement: number,
  volumeL: number,
): number {
  return (massG * percentElement * 10) / volumeL;
}

// ---- [II-3.2] Fertilizer mass to hit a target ppm (single-element inverse) ----
/** Valid only when the fertilizer uniquely supplies ONE target element. */
export function massForTargetPpm(
  targetPpm: number,
  volumeL: number,
  percentElement: number,
): number {
  return (targetPpm * volumeL) / (percentElement * 10);
}

// ---- [II-7.1] Micronutrient contribution (mass in mg) ----
export function microContributionPpm(
  massMg: number,
  percentElement: number,
  volumeL: number,
): number {
  return (massMg * percentElement * 10) / volumeL / 1000;
}

// ---- [II-7.2] Chelated iron — available Fe ----
/** ppm Fe delivered by a chelate product. %Fe is per PRODUCT (EDTA ~13, DTPA ~10-11, EDDHA ~6). */
export function chelatedFePpm(
  massChelateG: number,
  percentFeInProduct: number,
  volumeL: number,
): number {
  return (massChelateG * percentFeInProduct * 10) / volumeL;
}

/** Practical chelate pH ceilings (Fe precipitates above these). Not a formula. */
export const CHELATE_PH_CEILING: Record<string, number> = {
  EDTA: 6.0,
  DTPA: 7.5,
  EDDHA: 9.0,
};
