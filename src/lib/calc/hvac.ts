/**
 * HVAC sizing — dehumidifier, humidifier, AC/BTU, ventilation & carbon filter.
 * Guidance-level models: mass balances and W→BTU conversion, not a Manual-J
 * load calc. Every consumer must surface the safety factor and its caveats.
 */
import { absoluteHumidity } from "./psychro";
import { lDayToPintDay, wToBtuh, btuhToTon } from "./units";

// ---- Dehumidifier ----

/**
 * Grow-room latent load (L/day). At steady state essentially all irrigation
 * water that isn't retained in biomass or drained leaves the room as vapor.
 */
export function dehumGrowRoomLDay(waterInLDay: number, transpiredFraction = 0.9): number {
  return waterInLDay * transpiredFraction;
}

/** Latent load (L/day) from a per-plant transpiration rate. */
export function dehumFromPlants(plantCount: number, lPerPlantDay: number): number {
  return plantCount * lPerPlantDay;
}

/**
 * Total water (L ≈ kg) a wet harvest sheds drying from moisture fraction wi
 * to wf. Dry matter is conserved: water out = wetKg·(wi−wf)/(1−wf).
 */
export function dryingWaterLossL(wetWeightKg: number, wi: number, wf: number): number {
  if (wf >= 1) return Infinity;
  return (wetWeightKg * (wi - wf)) / (1 - wf);
}

/** Drying-room latent load (L/day) — total water loss spread over the drying period. */
export function dehumDryRoomLDay(
  wetWeightKg: number,
  wi: number,
  wf: number,
  dryingDays: number,
): number {
  return dryingDays > 0 ? dryingWaterLossL(wetWeightKg, wi, wf) / dryingDays : Infinity;
}

/**
 * Rated capacity to shop for. AHAM pint ratings assume 80 °F / 60 % RH;
 * real removal in a cooler room is lower — hence the safety factor.
 */
export function dehumidifierSize(
  loadLDay: number,
  safetyFactor = 1.3,
): { lDay: number; pintsDay: number } {
  const lDay = loadLDay * safetyFactor;
  return { lDay, pintsDay: lDayToPintDay(lDay) };
}

// ---- Humidifier ----

/**
 * Moisture output (L/day) to hold a target RH against air exchange:
 * g/h = ACH × V × Δ(absolute humidity), assuming make-up air enters at
 * room temperature and the current RH. 1 g water ≈ 1 mL.
 */
export function humidifierLoadLDay(
  roomVolumeM3: number,
  ach: number,
  tC: number,
  rhCurrentPct: number,
  rhTargetPct: number,
): number {
  const deltaGM3 = Math.max(0, absoluteHumidity(tC, rhTargetPct) - absoluteHumidity(tC, rhCurrentPct));
  const gPerHour = ach * roomVolumeM3 * deltaGM3;
  return (gPerHour * 24) / 1000;
}

/** One-time water (L) to raise the room's air from current to target RH. */
export function humidifierInitialChargeL(
  roomVolumeM3: number,
  tC: number,
  rhCurrentPct: number,
  rhTargetPct: number,
): number {
  const deltaGM3 = Math.max(0, absoluteHumidity(tC, rhTargetPct) - absoluteHumidity(tC, rhCurrentPct));
  return (roomVolumeM3 * deltaGM3) / 1000;
}

// ---- AC / BTU ----

/** Sensible heat load (W): indoors, electrical power in ≈ heat out. */
export function acHeatLoadW(i: {
  lightsW: number;
  equipmentW?: number;
  dehumidifierW?: number;
}): number {
  return i.lightsW + (i.equipmentW ?? 0) + (i.dehumidifierW ?? 0);
}

/** AC capacity to shop for, from total heat load. */
export function acSizing(
  totalHeatW: number,
  safetyFactor = 1.2,
): { btuh: number; tons: number; kw: number } {
  const w = totalHeatW * safetyFactor;
  const btuh = wToBtuh(w);
  return { btuh, tons: btuhToTon(btuh), kw: w / 1000 };
}

// ---- Ventilation & carbon filter ----

/** Base exhaust CFM: room volume ÷ minutes per full air exchange. */
export function ventilationBaseCfm(roomVolumeFt3: number, minutesPerExchange: number): number {
  return minutesPerExchange > 0 ? roomVolumeFt3 / minutesPerExchange : Infinity;
}

/**
 * Fan CFM after derating for restrictions. Carbon filter ~25 % loss, plus
 * optional ducting and heat (lights) multipliers. Filter should be RATED
 * at or above the resulting fan CFM.
 */
export function ventilationRequiredCfm(
  baseCfm: number,
  f: { filter?: number; ducting?: number; heat?: number } = {},
): number {
  return baseCfm * (f.filter ?? 1.25) * (f.ducting ?? 1.0) * (f.heat ?? 1.0);
}
