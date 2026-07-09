/**
 * Shared Foundations — unit conversions. [III-10.1], [IV-9.1], [II-1.5/1.6/1.7]
 *
 * Field errors happen at unit boundaries: normalize to SI on input. Every helper
 * here is a pure scalar transform so callers never hand-roll a magic multiplier.
 */
import { MOLAR_MASS } from "./constants";

// ---- Volume / flow ----
export const galToL = (gal: number) => gal * 3.7854;
export const lToGal = (l: number) => l * 0.2642;
export const gphToLh = (gph: number) => gph * 3.7854;
export const gpmToLmin = (gpm: number) => gpm * 3.7854;
export const lminToM3s = (lmin: number) => lmin * 1.6667e-5;
export const lhToM3s = (lh: number) => lh * 2.7778e-7;
export const m3hToLmin = (m3h: number) => m3h * 16.667;

// ---- Length / area / volume ----
export const ftToM = (ft: number) => ft * 0.3048;
export const inToMm = (inch: number) => inch * 25.4;
export const ft2ToM2 = (ft2: number) => ft2 * 0.092903;
export const ft3ToM3 = (ft3: number) => ft3 * 0.0283168;

// ---- Pressure / head ----
export const psiToMHead = (psi: number) => psi * 0.7031;
export const barToMHead = (bar: number) => bar * 10.197;
export const kpaToMHead = (kpa: number) => kpa * 0.10197;
export const mHeadToKpa = (m: number) => m * 9.8067;

// ---- HVAC / air ----
export const tonToKw = (ton: number) => ton * 3.5169;
export const btuhToW = (btuh: number) => btuh * 0.2931;
export const wToBtuh = (w: number) => w / 0.2931;
export const btuhToTon = (btuh: number) => btuh / 12_000;
export const tonToBtuh = (ton: number) => ton * 12_000;
export const cfmToM3h = (cfm: number) => cfm * 1.699;
export const cfmToLs = (cfm: number) => cfm * 0.4719;
export const pintDayToLDay = (pint: number) => pint * 0.4732;
export const lDayToPintDay = (l: number) => l * 2.1134;

// ---- Temperature ----
export const fToC = (f: number) => (f - 32) / 1.8;
export const cToF = (c: number) => c * 1.8 + 32;
export const cToK = (c: number) => c + 273.15;

// ---- Concentration primitives ----

/** [II-1.6] percent (w/w) <-> ppm. 1% = 10,000 ppm. */
export const percentToPpm = (pct: number) => pct * 10_000;
export const ppmToPercent = (ppm: number) => ppm / 10_000;

/** [II-1.3] ppm <-> mmol/L for a given element/ion molar mass. */
export function ppmToMmolL(ppm: number, molarMass: number): number {
  return ppm / molarMass;
}
export function mmolLToPpm(mmol: number, molarMass: number): number {
  return mmol * molarMass;
}

/** [II-1.4] ppm -> meq/L given molar mass and charge magnitude. */
export function ppmToMeqL(ppm: number, molarMass: number, charge: number): number {
  return (ppm / molarMass) * Math.abs(charge);
}

/** [II-1.7] Molarity (mol/L) -> weighable mass (g) of a compound. */
export function molarityToMass(
  molarity: number,
  volumeL: number,
  compoundMolarMass: number,
): number {
  return molarity * volumeL * compoundMolarMass;
}

/** Convenience: ppm of an element by symbol -> mmol/L. */
export function elementPpmToMmol(element: string, ppm: number): number {
  const m = MOLAR_MASS[element];
  if (!m) throw new Error(`Unknown element: ${element}`);
  return ppm / m;
}
