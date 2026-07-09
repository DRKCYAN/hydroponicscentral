/**
 * Skeleton demo data — stands in for persisted state so Monitor/Record/Configure
 * pages render with realistic content. One System owns its contextual state
 * (active recipe, water source, last log) exactly as the spec's shared-context
 * data model describes: one System, many views.
 */
import type { WaterProfile } from "@/lib/calc/water";

export interface SystemContext {
  id: string;
  name: string;
  type: "DWC" | "NFT" | "Drip" | "Ebb & Flow";
  reservoirL: number;
  crop: string;
  cropTargetId: string;
  stage: string;
  waterSourceId: string;
  activeRecipeId: string | null;
  // latest readings (from last Log Entry)
  ecTarget: number;
  phTarget: [number, number];
  last: {
    ec: number;
    ph: number;
    tempC: number;
    doMgL: number;
    reservoirPct: number;
    daysSinceTopOff: number;
    at: string;
  };
}

export const WATER_PROFILES: WaterProfile[] = [
  {
    id: "well-a",
    name: "Well A",
    ec: 0.55,
    ph: 7.6,
    Ca: 62,
    Mg: 18,
    Na: 24,
    Cl: 30,
    S: 22,
    K: 3,
    N: 2,
    alkalinity: 180,
  },
  {
    id: "ro",
    name: "RO / Rain",
    ec: 0.02,
    ph: 6.8,
    Ca: 0,
    Mg: 0,
    Na: 1,
    Cl: 1,
    S: 0,
    K: 0,
    N: 0,
    alkalinity: 5,
  },
  {
    id: "municipal",
    name: "Municipal (city)",
    ec: 0.42,
    ph: 7.9,
    Ca: 48,
    Mg: 12,
    Na: 30,
    Cl: 42,
    S: 16,
    K: 4,
    N: 1,
    alkalinity: 130,
  },
];

export const SYSTEMS: SystemContext[] = [
  {
    id: "tent-1",
    name: "Tent 1: Lettuce raft",
    type: "DWC",
    reservoirL: 120,
    crop: "Lettuce / leafy greens",
    cropTargetId: "lettuce-veg",
    stage: "Vegetative",
    waterSourceId: "well-a",
    activeRecipeId: "recipe-lettuce-1",
    ecTarget: 1.4,
    phTarget: [5.6, 6.0],
    last: {
      ec: 1.38,
      ph: 5.9,
      tempC: 20.5,
      doMgL: 7.4,
      reservoirPct: 68,
      daysSinceTopOff: 2,
      at: "2026-07-04T08:15:00",
    },
  },
  {
    id: "rack-2",
    name: "Rack 2: Tomato drip",
    type: "Drip",
    reservoirL: 200,
    crop: "Tomato",
    cropTargetId: "tomato-fruit",
    stage: "Fruiting",
    waterSourceId: "municipal",
    activeRecipeId: "recipe-tomato-1",
    ecTarget: 2.6,
    phTarget: [5.8, 6.2],
    last: {
      ec: 2.95,
      ph: 6.4,
      tempC: 22.8,
      doMgL: 6.1,
      reservoirPct: 41,
      daysSinceTopOff: 4,
      at: "2026-07-03T18:40:00",
    },
  },
  {
    id: "nft-3",
    name: "NFT 3: Basil channels",
    type: "NFT",
    reservoirL: 80,
    crop: "Basil / herbs",
    cropTargetId: "basil",
    stage: "Vegetative",
    waterSourceId: "ro",
    activeRecipeId: null,
    ecTarget: 1.6,
    phTarget: [5.8, 6.2],
    last: {
      ec: 1.55,
      ph: 6.0,
      tempC: 21.2,
      doMgL: 7.9,
      reservoirPct: 82,
      daysSinceTopOff: 1,
      at: "2026-07-04T07:05:00",
    },
  },
];

export interface LogRow {
  at: string;
  ec: number;
  ph: number;
  tempC: number;
  doMgL: number;
  topOffL: number;
}

export const LOG_HISTORY: Record<string, LogRow[]> = {
  "tent-1": [
    { at: "2026-06-28", ec: 1.42, ph: 5.8, tempC: 20.1, doMgL: 7.6, topOffL: 0 },
    { at: "2026-06-30", ec: 1.4, ph: 5.9, tempC: 20.3, doMgL: 7.5, topOffL: 8 },
    { at: "2026-07-02", ec: 1.39, ph: 5.9, tempC: 20.4, doMgL: 7.4, topOffL: 10 },
    { at: "2026-07-04", ec: 1.38, ph: 5.9, tempC: 20.5, doMgL: 7.4, topOffL: 9 },
  ],
  "rack-2": [
    { at: "2026-06-27", ec: 2.6, ph: 6.0, tempC: 22.1, doMgL: 6.4, topOffL: 0 },
    { at: "2026-06-29", ec: 2.72, ph: 6.1, tempC: 22.4, doMgL: 6.3, topOffL: 22 },
    { at: "2026-07-01", ec: 2.85, ph: 6.3, tempC: 22.6, doMgL: 6.2, topOffL: 25 },
    { at: "2026-07-03", ec: 2.95, ph: 6.4, tempC: 22.8, doMgL: 6.1, topOffL: 24 },
  ],
  "nft-3": [
    { at: "2026-07-01", ec: 1.58, ph: 6.1, tempC: 21.0, doMgL: 8.0, topOffL: 0 },
    { at: "2026-07-02", ec: 1.56, ph: 6.0, tempC: 21.1, doMgL: 7.9, topOffL: 4 },
    { at: "2026-07-04", ec: 1.55, ph: 6.0, tempC: 21.2, doMgL: 7.9, topOffL: 5 },
  ],
};

export interface HarvestRow {
  at: string;
  system: string;
  crop: string;
  freshKg: number;
  units: number;
  gradeA: number; // fraction
  notes: string;
}

export const HARVESTS: HarvestRow[] = [
  {
    at: "2026-06-20",
    system: "Tent 1: Lettuce raft",
    crop: "Lettuce",
    freshKg: 14.2,
    units: 96,
    gradeA: 0.86,
    notes: "Clean cut, low tipburn.",
  },
  {
    at: "2026-05-30",
    system: "Rack 2: Tomato drip",
    crop: "Tomato",
    freshKg: 38.6,
    units: 210,
    gradeA: 0.78,
    notes: "Some cat-facing on first truss.",
  },
];

export function systemById(id: string): SystemContext | undefined {
  return SYSTEMS.find((s) => s.id === id);
}
export function waterById(id: string): WaterProfile | undefined {
  return WATER_PROFILES.find((w) => w.id === id);
}

/** Simple status classification used across Monitor screens. */
export type Status = "ok" | "caution" | "danger";
export function ecStatus(value: number, target: number): Status {
  const dev = Math.abs(value - target) / target;
  if (dev <= 0.1) return "ok";
  if (dev <= 0.25) return "caution";
  return "danger";
}
export function phStatus(value: number, range: [number, number]): Status {
  if (value >= range[0] && value <= range[1]) return "ok";
  const pad = 0.3;
  if (value >= range[0] - pad && value <= range[1] + pad) return "caution";
  return "danger";
}
