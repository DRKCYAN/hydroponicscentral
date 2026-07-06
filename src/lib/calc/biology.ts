/**
 * Biology / growth analysis — Dashboard drawdown + System History trends.
 * Uptake [I-4.x], temperature [I-5.1], GDD [I-1.11/1.12], DO [I-5.5],
 * growth analysis [I-1.1..1.10], canopy/light [I-2.5..2.9], efficiencies.
 */

// ---- [I-4.1/4.2] Michaelis–Menten ion uptake ----
export function michaelisMenten(vMax: number, c: number, km: number, cMin = 0): number {
  const eff = c - cMin;
  if (eff <= 0) return 0;
  return (vMax * eff) / (km + eff);
}

// ---- [I-4.4] Solution depletion rate (µmol·L⁻¹·h⁻¹) ----
export function depletionRate(uptakePerG: number, rootMassG: number, volumeL: number): number {
  return -(uptakePerG * rootMassG) / volumeL;
}

// ---- [I-4.3] Nutrient demand from growth ----
export function nutrientDemand(deltaBiomassG: number, cTissue: number): number {
  return deltaBiomassG * cTissue;
}

// ---- [I-5.1] Q10 temperature coefficient ----
export function q10(rate1: number, q10Coeff: number, t1: number, t2: number): number {
  return rate1 * Math.pow(q10Coeff, (t2 - t1) / 10);
}

// ---- [I-1.11] GDD / thermal time ----
export function gddDay(tMax: number, tMin: number, tBase: number, tUpper?: number): number {
  const hi = tUpper != null ? Math.min(tMax, tUpper) : tMax;
  const mean = (hi + tMin) / 2;
  return Math.max(0, mean - tBase);
}
export function gddAccumulate(days: { tMax: number; tMin: number }[], tBase: number): number {
  return days.reduce((s, d) => s + gddDay(d.tMax, d.tMin, tBase), 0);
}

// ---- [I-1.12] Days to stage ----
export function daysToStage(gddRequired: number, gddPerDayAvg: number): number {
  return gddPerDayAvg > 0 ? gddRequired / gddPerDayAvg : Infinity;
}

// ---- [I-5.5] Dissolved oxygen deficit ----
export function doDeficit(rodMgH: number, doAvailableMgL: number, turnoverLh: number): number {
  return rodMgH - doAvailableMgL * turnoverLh;
}

// ---- [I-1.x] Growth analysis ----
export const agr = (w1: number, w2: number, t1: number, t2: number) => (w2 - w1) / (t2 - t1);
export const rgr = (w1: number, w2: number, t1: number, t2: number) =>
  (Math.log(w2) - Math.log(w1)) / (t2 - t1);
export const doublingTime = (rgrVal: number) => Math.log(2) / rgrVal;
export const lai = (aLeaf: number, aGround: number) => aLeaf / aGround;
export const sla = (aLeaf: number, wLeaf: number) => aLeaf / wLeaf;
export const lwr = (wLeaf: number, wTotal: number) => wLeaf / wTotal;
export const lar = (aLeaf: number, wTotal: number) => aLeaf / wTotal;
export const rootShoot = (wRoot: number, wShoot: number) => wRoot / wShoot;

export function nar(
  w1: number,
  w2: number,
  a1: number,
  a2: number,
  t1: number,
  t2: number,
): number {
  const dW = (w2 - w1) / (t2 - t1);
  const laTerm = (Math.log(a2) - Math.log(a1)) / (a2 - a1);
  return dW * laTerm;
}
export const cgr = (narVal: number, laiVal: number) => narVal * laiVal;

// ---- [I-2.5] Beer–Lambert canopy light interception ----
export function fractionIntercepted(k: number, laiVal: number): number {
  return 1 - Math.exp(-k * laiVal);
}

// ---- [I-2.6] Non-rectangular hyperbola leaf photosynthesis ----
export function photosynthesisNRH(
  I: number,
  phi: number,
  pMax: number,
  theta: number,
  rd: number,
): number {
  const a = phi * I + pMax;
  const disc = Math.max(0, a * a - 4 * theta * phi * I * pMax);
  return (a - Math.sqrt(disc)) / (2 * theta) - rd;
}

// ---- Efficiencies ----
export const wue = (deltaBiomassG: number, waterL: number) => deltaBiomassG / waterL;
export const nue = (deltaBiomassG: number, nutrientG: number) => deltaBiomassG / nutrientG;
export const lue = (deltaBiomassG: number, interceptedParMol: number) =>
  deltaBiomassG / interceptedParMol;
