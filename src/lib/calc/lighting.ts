/**
 * Lighting — fixture wattage ↔ PPF ↔ average PPFD over a coverage area.
 * Uniform-distribution estimates with a spill/utilization factor, not
 * photometric maps: real canopy PPFD needs a PAR meter or the fixture's
 * published PPFD chart. DLI comes from psychro's dli().
 */

/** Total photon flux PPF (µmol/s) from wattage × efficacy (µmol/J). */
export function ppfFromWattage(wattage: number, efficacyUmolJ: number): number {
  return wattage * efficacyUmolJ;
}

/**
 * Average canopy PPFD (µmol·m⁻²·s⁻¹) if PPF spreads uniformly over the area;
 * utilization discounts wall spill and reflector losses.
 */
export function averagePpfd(ppf: number, areaM2: number, utilization = 0.9): number {
  return areaM2 > 0 ? (ppf * utilization) / areaM2 : 0;
}

/** Fixture wattage needed to hit a target average PPFD over an area. */
export function wattageForPpfd(
  targetPpfd: number,
  areaM2: number,
  efficacyUmolJ: number,
  utilization = 0.9,
): number {
  return efficacyUmolJ > 0 && utilization > 0
    ? (targetPpfd * areaM2) / (efficacyUmolJ * utilization)
    : Infinity;
}
