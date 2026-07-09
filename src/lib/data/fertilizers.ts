/**
 * Fertilizer salt library — [II-9.3] common salts, %element for the ACTUAL
 * PRODUCT FORM the grower buys (hydrated salt), not the anhydrous salt.
 *
 * Fractions here are 0–1 (elemental mass fraction) so they load straight into
 * the solver's A matrix without the 100× trap. `label` shows the %’s a grower
 * reads on the bag; `hydration` documents the water-of-crystallization form.
 */
import type { FertColumn } from "@/lib/calc/solver";

export interface FertilizerEntry extends FertColumn {
  formula: string;
  hydration: string;
  label: string; // guaranteed-analysis style
  shared: boolean; // shared DB entry vs personal/custom
  safety?: string;
}

/** Elemental mass fractions (0–1). Derived from the hydrated product form. */
export const FERTILIZERS: FertilizerEntry[] = [
  {
    id: "calnit",
    name: "Calcium Nitrate (fertigation grade)",
    formula: "Ca(NO3)2·NH4NO3·xH2O",
    hydration: "hydrated",
    label: "15.5-0-0 · 19% Ca",
    shared: true,
    fractions: { N: 0.155, Ca: 0.19 },
    safety: "Calcium source: keep in Stock A, never with sulfate/phosphate.",
  },
  {
    id: "kno3",
    name: "Potassium Nitrate",
    formula: "KNO3",
    hydration: "anhydrous",
    label: "13-0-46",
    shared: true,
    fractions: { N: 0.139, K: 0.387 },
  },
  {
    id: "mkp",
    name: "Monopotassium Phosphate (MKP)",
    formula: "KH2PO4",
    hydration: "anhydrous",
    label: "0-52-34",
    shared: true,
    fractions: { P: 0.228, K: 0.287 },
    safety: "Phosphate: Stock B only (precipitates with calcium).",
  },
  {
    id: "map",
    name: "Monoammonium Phosphate (MAP)",
    formula: "NH4H2PO4",
    hydration: "anhydrous",
    label: "12-61-0",
    shared: true,
    fractions: { N: 0.122, P: 0.269 },
    safety: "Phosphate: Stock B only.",
  },
  {
    id: "kso4",
    name: "Potassium Sulfate",
    formula: "K2SO4",
    hydration: "anhydrous",
    label: "0-0-50 · 18% S",
    shared: true,
    fractions: { K: 0.449, S: 0.184 },
    safety: "Sulfate: Stock B only.",
  },
  {
    id: "epsom",
    name: "Magnesium Sulfate (Epsom)",
    formula: "MgSO4·7H2O",
    hydration: "heptahydrate",
    label: "9.9% Mg · 13% S",
    shared: true,
    fractions: { Mg: 0.099, S: 0.13 },
    safety: "Heptahydrate: anhydrous figure (20.2% Mg) would DOUBLE the dose.",
  },
  {
    id: "cacl2",
    name: "Calcium Chloride (dihydrate)",
    formula: "CaCl2·2H2O",
    hydration: "dihydrate",
    label: "27.3% Ca",
    shared: true,
    fractions: { Ca: 0.273, Cl: 0.483 },
    safety: "Check hydration form on the bag: anhydrous is 36.1% Ca.",
  },
  {
    id: "kcl",
    name: "Potassium Chloride",
    formula: "KCl",
    hydration: "anhydrous",
    label: "0-0-60",
    shared: true,
    fractions: { K: 0.524, Cl: 0.476 },
  },
  {
    id: "mgno3",
    name: "Magnesium Nitrate",
    formula: "Mg(NO3)2·6H2O",
    hydration: "hexahydrate",
    label: "10.9% N · 9.5% Mg",
    shared: true,
    fractions: { N: 0.109, Mg: 0.095 },
  },
];

export const MACRO_ELEMENTS = ["N", "P", "K", "Ca", "Mg", "S"] as const;
export type MacroElement = (typeof MACRO_ELEMENTS)[number];

export function fertilizerById(id: string): FertilizerEntry | undefined {
  return FERTILIZERS.find((f) => f.id === id);
}
