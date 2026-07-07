/**
 * Demo dataset for signed-out visitors. The app is fully explorable without an
 * account — sign-in is only required to save your own data — so every page
 * that normally reads Supabase rows falls back to these Db-shaped rows,
 * derived from the skeleton content in mock.ts (single source of truth).
 */
import {
  SYSTEMS,
  WATER_PROFILES,
  LOG_HISTORY,
  HARVESTS,
} from "@/lib/data/mock";
import type {
  DbSystem,
  DbWaterSource,
  DbLogEntry,
  DbHarvestEntry,
} from "@/lib/supabase/types";

const DEMO_USER_ID = "demo";
const DEMO_TIMESTAMP = "2026-06-01T00:00:00Z";

export const DEMO_WATER_SOURCES: DbWaterSource[] = WATER_PROFILES.map((w) => ({
  id: w.id,
  user_id: DEMO_USER_ID,
  name: w.name,
  ec: w.ec,
  ph: w.ph,
  ca_ppm: w.Ca,
  mg_ppm: w.Mg,
  na_ppm: w.Na,
  cl_ppm: w.Cl,
  s_ppm: w.S,
  k_ppm: w.K,
  n_ppm: w.N,
  alkalinity: w.alkalinity,
  created_at: DEMO_TIMESTAMP,
}));

export const DEMO_SYSTEMS: DbSystem[] = SYSTEMS.map((s) => ({
  id: s.id,
  user_id: DEMO_USER_ID,
  name: s.name,
  type: s.type,
  reservoir_l: s.reservoirL,
  crop: s.crop,
  crop_target_id: s.cropTargetId,
  stage: s.stage,
  water_source_id: s.waterSourceId,
  active_recipe_id: s.activeRecipeId,
  ec_target: s.ecTarget,
  ph_target_low: s.phTarget[0],
  ph_target_high: s.phTarget[1],
  last_ec: s.last.ec,
  last_ph: s.last.ph,
  last_temp_c: s.last.tempC,
  last_do_mg_l: s.last.doMgL,
  last_reservoir_pct: s.last.reservoirPct,
  last_at: s.last.at,
  created_at: DEMO_TIMESTAMP,
  updated_at: s.last.at,
  water_sources: DEMO_WATER_SOURCES.find((w) => w.id === s.waterSourceId) ?? null,
}));

export const DEMO_LOG_ENTRIES: DbLogEntry[] = Object.entries(LOG_HISTORY).flatMap(
  ([systemId, rows]) =>
    rows.map((r, i) => ({
      id: `${systemId}-log-${i}`,
      system_id: systemId,
      user_id: DEMO_USER_ID,
      logged_at: r.at,
      ec: r.ec,
      ph: r.ph,
      temp_c: r.tempC,
      do_mg_l: r.doMgL,
      top_off_l: r.topOffL,
      reservoir_pct: null,
      notes: null,
    }))
);

export const DEMO_HARVESTS: DbHarvestEntry[] = HARVESTS.map((h, i) => ({
  id: `demo-harvest-${i}`,
  user_id: DEMO_USER_ID,
  system_id: null,
  harvested_at: h.at,
  crop: h.crop,
  fresh_kg: h.freshKg,
  units: h.units,
  grade_a_fraction: h.gradeA,
  notes: h.notes,
  created_at: h.at,
  systems: { name: h.system },
}));

export function demoSystemById(id: string): DbSystem | undefined {
  return DEMO_SYSTEMS.find((s) => s.id === id);
}

export function demoLogsForSystem(id: string): DbLogEntry[] {
  return DEMO_LOG_ENTRIES.filter((l) => l.system_id === id);
}
