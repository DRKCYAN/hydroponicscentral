/**
 * [II-3.5] Preset recipes — fixed solutions of the solver's system. Stored as a
 * salt list + grams per unit volume; the engine computes actual ppm at the
 * user's volume. Verify grams against the product label (formulations vary).
 */
export interface RecipePreset {
  id: string;
  name: string;
  note: string;
  /** grams per liter of each fertilizer id (from FERTILIZERS). */
  gramsPerLiter: Record<string, number>;
}

export const RECIPE_PRESETS: RecipePreset[] = [
  {
    id: "jacks-321",
    name: "Jack's 321 (approx)",
    note: "5-12-26 + Cal-Nit + Epsom, classic 3.5 : 2.4 : 1.2 g/gal. Modeled here with single salts.",
    gramsPerLiter: { calnit: 0.63, kno3: 0.35, mkp: 0.17, epsom: 0.32 },
  },
  {
    id: "masterblend-tomato",
    name: "Masterblend Tomato (approx)",
    note: "4-18-38 + Cal-Nit + Epsom, ~2:2:1 mass ratio. Modeled with single salts.",
    gramsPerLiter: { calnit: 0.66, mkp: 0.2, kno3: 0.4, epsom: 0.33 },
  },
  {
    id: "lettuce-lite",
    name: "Leafy-green lite",
    note: "Low-EC leafy-green blend for soft water.",
    gramsPerLiter: { calnit: 0.5, kno3: 0.25, mkp: 0.13, epsom: 0.24 },
  },
];
