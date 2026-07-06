/**
 * pH & acid/base dosing + reservoir replenishment.
 * [II-5.1] pH<->[H+], [II-5.3] acid dose, [II-5.4] buffer capacity,
 * [II-5.5] base dose, [II-6.1] top-off mass balance, [II-6.2] accumulation,
 * [II-6.3] replenishment dosing, [II-6.4] reservoir refresh fraction.
 */
import { CACO3_EQ_WEIGHT } from "./constants";

// ---- [II-5.1] pH <-> [H+] ----
export const hFromPh = (ph: number) => Math.pow(10, -ph);
export const phFromH = (h: number) => -Math.log10(h);

/** Effective protons for common acids down to the 5.5–6.5 target range. */
export const ACID_NORMALITY_NOTE: Record<string, string> = {
  phosphoric: "H3PO4 ≈ monoprotic to pH ~4.5; also adds P back into totals.",
  sulfuric: "H2SO4 ≈ diprotic; adds S back into totals.",
  nitric: "HNO3 ≈ monoprotic; adds N back into totals.",
};

// ---- [II-5.3] Acid dose to neutralize alkalinity ----
export interface AcidDoseInput {
  alkCurrent: number; // mg/L as CaCO3
  alkTarget: number; // mg/L as CaCO3 (leave ~30–50 as buffer)
  acidNormality: number; // eq/L of the acid stock
  volumeL: number;
}
export interface AcidDoseResult {
  meqPerL: number;
  mlPerL: number;
  totalMl: number;
}
export function acidDose(input: AcidDoseInput): AcidDoseResult {
  const meqPerL = Math.max(0, input.alkCurrent - input.alkTarget) / CACO3_EQ_WEIGHT;
  const mlPerL = input.acidNormality > 0 ? meqPerL / input.acidNormality : 0;
  return { meqPerL, mlPerL, totalMl: mlPerL * input.volumeL };
}

// ---- [II-5.4] Buffer capacity ----
export function bufferCapacity(deltaCMeqL: number, deltaPh: number): number {
  return deltaPh === 0 ? Infinity : deltaCMeqL / deltaPh;
}

// ---- [II-5.5] Base dose (pH up) ----
export function baseDose(
  deltaPh: number,
  beta: number,
  volumeL: number,
  nBase: number,
): { meqPerL: number; totalVol: number } {
  const meqPerL = deltaPh * beta;
  return { meqPerL, totalVol: nBase > 0 ? (meqPerL * volumeL) / nBase : 0 };
}

// ---- [II-6.1] Top-off mass balance ----
/** New ion concentration after topping off with source water. */
export function topOffConcentration(
  cOld: number,
  vRemaining: number,
  cTopoff: number,
  vAdded: number,
): number {
  const denom = vRemaining + vAdded;
  return denom === 0 ? cOld : (cOld * vRemaining + cTopoff * vAdded) / denom;
}

// ---- [II-6.2] Cumulative accumulation of non-absorbed ions (Na, Cl) ----
/**
 * Iterate the top-off balance across cycles. Rounding at the decision boundary
 * (not physical drift) is what makes the dump threshold reproducible.
 */
export function accumulateIon(
  c0: number,
  cycles: number,
  vRemaining: number,
  vAdded: number,
  cSource: number,
  roundTo = 0.1,
): number[] {
  const series: number[] = [round(c0, roundTo)];
  let c = c0;
  for (let n = 0; n < cycles; n++) {
    c = topOffConcentration(c, vRemaining, cSource, vAdded);
    series.push(round(c, roundTo));
  }
  return series;
}
function round(v: number, step: number): number {
  return Math.round(v / step) * step;
}

// ---- [II-6.3] Nutrient replenishment after depletion ----
export function replenishmentMass(
  ppmTarget: number,
  ppmCurrent: number,
  volumeL: number,
  percentElement: number,
): number {
  return (Math.max(0, ppmTarget - ppmCurrent) * volumeL) / (percentElement * 10);
}

// ---- [II-6.4] Reservoir replacement / refresh fraction ----
export function refreshFraction(cCurrent: number, cTarget: number, cFreshmix: number): number {
  const denom = cCurrent - cFreshmix;
  if (denom === 0) return 0;
  return Math.max(0, Math.min(1, (cCurrent - cTarget) / denom));
}
