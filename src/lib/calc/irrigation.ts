/**
 * Pump & irrigation flow sizing. Guidance-level: static lift plus a flat
 * friction allowance, not Hazen-Williams — the buyer must still read the
 * pump's GPH-at-height curve at the computed head.
 */

/** GPH to turn the reservoir over N times per hour. */
export function pumpGphForTurnover(reservoirVolGal: number, turnoversPerHour: number): number {
  return reservoirVolGal * turnoversPerHour;
}

/** Combined demand (GPH) of all emitters/drippers. */
export function emitterTotalGph(emitterCount: number, gphPerEmitter: number): number {
  return emitterCount * gphPerEmitter;
}

/** Pump GPH to shop for: the larger demand, padded for head loss and wear. */
export function requiredPumpGph(
  turnoverGph: number,
  emitterGph: number,
  safetyFactor = 1.2,
): number {
  return Math.max(turnoverGph, emitterGph) * safetyFactor;
}

/** Total dynamic head (ft): vertical lift plus friction allowance. */
export function totalDynamicHeadFt(staticLiftFt: number, frictionLossFt = 0): number {
  return staticLiftFt + frictionLossFt;
}
