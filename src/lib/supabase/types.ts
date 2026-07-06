export type SubscriptionTier = "free" | "pro" | "pro_reservoir";
export type SystemType = "DWC" | "NFT" | "Drip" | "Ebb & Flow";
export type Status = "ok" | "caution" | "danger";

export interface DbProfile {
  id: string;
  display_name: string | null;
  subscription_tier: SubscriptionTier;
  updated_at: string;
}

export interface DbWaterSource {
  id: string;
  user_id: string;
  name: string;
  ec: number;
  ph: number;
  ca_ppm: number;
  mg_ppm: number;
  na_ppm: number;
  cl_ppm: number;
  s_ppm: number;
  k_ppm: number;
  n_ppm: number;
  alkalinity: number;
  created_at: string;
}

export interface DbSystem {
  id: string;
  user_id: string;
  name: string;
  type: SystemType;
  reservoir_l: number;
  crop: string;
  crop_target_id: string;
  stage: string;
  water_source_id: string | null;
  active_recipe_id: string | null;
  ec_target: number;
  ph_target_low: number;
  ph_target_high: number;
  last_ec: number | null;
  last_ph: number | null;
  last_temp_c: number | null;
  last_do_mg_l: number | null;
  last_reservoir_pct: number | null;
  last_at: string | null;
  created_at: string;
  updated_at: string;
  water_sources?: DbWaterSource | null;
}

export interface DbLogEntry {
  id: string;
  system_id: string;
  user_id: string;
  logged_at: string;
  ec: number;
  ph: number;
  temp_c: number | null;
  do_mg_l: number | null;
  top_off_l: number;
  reservoir_pct: number | null;
  notes: string | null;
}

export interface DbHarvestEntry {
  id: string;
  user_id: string;
  system_id: string | null;
  harvested_at: string;
  crop: string;
  fresh_kg: number;
  units: number | null;
  grade_a_fraction: number | null;
  notes: string | null;
  created_at: string;
  systems?: { name: string } | null;
}

export interface DbFertilizer {
  id: string;
  user_id: string;
  name: string;
  formula: string | null;
  hydration: string | null;
  label: string | null;
  frac_n: number;
  frac_p: number;
  frac_k: number;
  frac_ca: number;
  frac_mg: number;
  frac_s: number;
  frac_cl: number;
  created_at: string;
}
