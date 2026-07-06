/**
 * Water Source Profiles — properties derived from a water test.
 * [II-4.3] hardness, [II-5.2] alkalinity unit conversion.
 */
import { CACO3_EQ_WEIGHT } from "./constants";

/** [II-4.3] Total hardness as CaCO3 (mg/L) from Ca and Mg ppm. */
export function waterHardness(caPpm: number, mgPpm: number): number {
  return 2.497 * caPpm + 4.116 * mgPpm;
}

/** [II-5.2] Alkalinity mg/L as CaCO3 -> meq/L. */
export function alkalinityToMeqL(alkMgCaco3: number): number {
  return alkMgCaco3 / CACO3_EQ_WEIGHT;
}
export function alkalinityToMgCaco3(alkMeqL: number): number {
  return alkMeqL * CACO3_EQ_WEIGHT;
}

/** A stored water source profile (measured ion concentrations, ppm). */
export interface WaterProfile {
  id: string;
  name: string;
  ec: number; // mS/cm
  ph: number;
  Ca: number;
  Mg: number;
  Na: number;
  Cl: number;
  S: number;
  K: number;
  N: number;
  alkalinity: number; // mg/L as CaCO3
}

export function emptyWaterProfile(): Omit<WaterProfile, "id" | "name"> {
  return { ec: 0, ph: 7, Ca: 0, Mg: 0, Na: 0, Cl: 0, S: 0, K: 0, N: 0, alkalinity: 0 };
}
