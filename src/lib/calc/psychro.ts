/**
 * Psychrometrics & CO2 — the Dashboard's live environmental state.
 * [IV-1.1..1.8] SVP, e_a, VPD, humidity ratio, absolute humidity, dew point,
 * enthalpy, density; [IV-7.2] VPD->RH; [IV-7.3] wet bulb; [IV-4.x] CO2.
 */
import { CONST } from "./constants";

/** [IV-1.1] Saturation vapor pressure (kPa). */
export function svp(tC: number): number {
  return 0.6108 * Math.exp((17.27 * tC) / (tC + 237.3));
}

/** [IV-1.2] Actual vapor pressure (kPa). */
export function actualVaporPressure(tC: number, rhPct: number): number {
  return svp(tC) * (rhPct / 100);
}

/** [IV-1.3] Vapor pressure deficit (kPa) — the control setpoint. */
export function vpd(tC: number, rhPct: number): number {
  return svp(tC) * (1 - rhPct / 100);
}

/** [IV-1.4] Humidity ratio (kg water / kg dry air) — conserved under T change. */
export function humidityRatio(tC: number, rhPct: number, pAtm = CONST.Patm): number {
  const ea = actualVaporPressure(tC, rhPct);
  return (CONST.mWaterOverMdryAir * ea) / (pAtm - ea);
}

/** [IV-1.5] Absolute humidity (g water / m³). T in °C. */
export function absoluteHumidity(tC: number, rhPct: number): number {
  const ea = actualVaporPressure(tC, rhPct);
  return (2166.8 * ea) / (tC + 273.15);
}

/** [IV-1.6] Dew point (°C). */
export function dewPoint(tC: number, rhPct: number): number {
  const alpha = Math.log(rhPct / 100) + (17.27 * tC) / (tC + 237.3);
  return (237.3 * alpha) / (17.27 - alpha);
}

/** [IV-1.7] Moist-air enthalpy (kJ/kg dry air). */
export function enthalpy(tC: number, rhPct: number): number {
  const w = humidityRatio(tC, rhPct);
  return 1.006 * tC + w * (2501 + 1.86 * tC);
}

/** [IV-7.2] VPD target -> RH setpoint (%) at a given temperature. */
export function vpdToRh(vpdTarget: number, tC: number): number {
  return (1 - vpdTarget / svp(tC)) * 100;
}

/** [IV-7.3] Wet-bulb temperature (°C), Stull approximation. */
export function wetBulb(tC: number, rhPct: number): number {
  return (
    tC * Math.atan(0.151977 * Math.sqrt(rhPct + 8.313659)) +
    Math.atan(tC + rhPct) -
    Math.atan(rhPct - 1.676331) +
    0.00391838 * Math.pow(rhPct, 1.5) * Math.atan(0.023101 * rhPct) -
    4.686035
  );
}

// ---- CO2 enrichment ----
/** [IV-4.1] CO2 mass (g) to raise a room by Δppm. */
export function co2MassForChange(deltaPpm: number, vRoomM3: number): number {
  return (deltaPpm / 1_000_000) * vRoomM3 * CONST.co2Density;
}

/** [IV-4.4] CO2 lost (g/h) to air exchange. */
export function co2LossAirExchange(
  qExchangeM3h: number,
  cSetpointPpm: number,
  cAmbientPpm: number,
): number {
  return (qExchangeM3h * (cSetpointPpm - cAmbientPpm) * CONST.co2Density) / 1_000_000;
}

/** [IV-4.5] Time (h) to reach a setpoint given injector capacity (g/h). */
export function co2TimeToSetpoint(massNeededG: number, injectorGh: number): number {
  return injectorGh > 0 ? massNeededG / injectorGh : Infinity;
}

/** [I-2.1] Daily light integral (mol·m⁻²·day⁻¹) from PPFD + photoperiod. */
export function dli(ppfd: number, photoperiodH: number): number {
  return (ppfd * photoperiodH * 3600) / 1_000_000;
}
