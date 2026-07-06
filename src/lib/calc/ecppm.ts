/**
 * EC <-> ppm / TDS and EC temperature correction.
 * [II-1.1] EC<->ppm, [II-1.2] temperature correction.
 *
 * Critical: there is NO single true EC->ppm conversion — it depends on the
 * meter's scale. Always store which scale a ppm value came from.
 */
import { EC_SCALE, EC_TEMP_ALPHA, type EcScale } from "./constants";

/** [II-1.1] EC (mS/cm) -> ppm on a named meter scale. */
export function ecToPpm(ecMsCm: number, scale: EcScale = "ppm500"): number {
  return ecMsCm * EC_SCALE[scale];
}

/** [II-1.1] ppm -> EC (mS/cm). The scale MUST match how the ppm was measured. */
export function ppmToEc(ppm: number, scale: EcScale = "ppm500"): number {
  return ppm / EC_SCALE[scale];
}

/** Convert a ppm reading from one meter scale to another (round-trips via EC). */
export function convertPpmScale(ppm: number, from: EcScale, to: EcScale): number {
  return ecToPpm(ppmToEc(ppm, from), to);
}

/**
 * [II-1.2] Correct a raw EC reading taken at temperature T back to 25 °C.
 * Most modern meters do this internally — expose it, don't double-correct.
 */
export function ecTempCorrect(
  ecMeasured: number,
  tempC: number,
  alpha: number = EC_TEMP_ALPHA,
): number {
  return ecMeasured / (1 + alpha * (tempC - 25));
}

/** Uncorrect: what a 25 °C-referenced EC would read at temperature T. */
export function ecAtTemp(
  ec25: number,
  tempC: number,
  alpha: number = EC_TEMP_ALPHA,
): number {
  return ec25 * (1 + alpha * (tempC - 25));
}

export const EC_SCALE_LABEL: Record<EcScale, string> = {
  ppm500: "500 (NaCl / TDS · Hanna)",
  eu640: "640 (European)",
  ppm700: "700 (KCl · Truncheon)",
};
