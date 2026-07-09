/**
 * Calculator registry — the single source of truth for every public tool.
 * The /calculators index, homepage hub, sitemap, and footer all render from
 * this list so names, slugs, and blurbs cannot drift apart. Plain data only
 * (no JSX) so it is importable from server and client alike.
 */

export type CalcCategory =
  | "Nutrients & Water"
  | "Environment & Climate"
  | "Lighting"
  | "Irrigation & Systems"
  | "Energy & Economics";

export interface CalcEntry {
  slug: string;
  name: string;
  category: CalcCategory;
  blurb: string;
  /** The real search query the tool targets, quoted as users type it. */
  query?: string;
  tag?: string;
}

export const CALC_CATEGORIES: CalcCategory[] = [
  "Nutrients & Water",
  "Environment & Climate",
  "Lighting",
  "Irrigation & Systems",
  "Energy & Economics",
];

export const calcHref = (slug: string) => `/calculators/${slug}`;

export const CALCULATORS: CalcEntry[] = [
  // ---- Nutrients & Water ----
  {
    slug: "ec-ppm",
    name: "EC ↔ ppm converter",
    category: "Nutrients & Water",
    query: "“ec to ppm hydroponics”",
    blurb:
      "Convert between EC and ppm on any meter scale (500 / 640 / 700), with 25 °C temperature correction.",
    tag: "Free",
  },
  {
    slug: "label-decoder",
    name: "Fertilizer label decoder",
    category: "Nutrients & Water",
    query: "“convert P2O5 to P”",
    blurb:
      "Turn a guaranteed-analysis N-P-K label (oxide form) into the elemental percentages every ppm calc needs.",
    tag: "Free",
  },
  {
    slug: "recipe-solver",
    name: "Recipe solver",
    category: "Nutrients & Water",
    query: "“hydroponic nutrient calculator”",
    blurb:
      "The real multi-salt engine: enter target ppm, get grams per fertilizer and a solved ion balance. One free solve.",
    tag: "1 free solve",
  },
  {
    slug: "dilution",
    name: "Dilution & injector calculator",
    category: "Nutrients & Water",
    query: "“nutrient dilution calculator”",
    blurb:
      "Solve C₁V₁ = C₂V₂ for any missing value, and size stock concentrate for a 1:R injector, with the ratio convention made explicit.",
    tag: "Free",
  },

  // ---- Environment & Climate ----
  {
    slug: "vpd",
    name: "VPD calculator",
    category: "Environment & Climate",
    query: "“vpd calculator”",
    blurb:
      "Air temp, humidity, and leaf-temperature offset → air and leaf VPD in kPa, checked against stage targets.",
    tag: "Free",
  },
  {
    slug: "dehumidifier",
    name: "Dehumidifier sizing",
    category: "Environment & Climate",
    query: "“grow room dehumidifier size”",
    blurb:
      "Pints-per-day capacity for a grow room (from water fed) or a drying room (from wet harvest weight).",
    tag: "Free",
  },
  {
    slug: "humidifier",
    name: "Humidifier sizing",
    category: "Environment & Climate",
    query: "“grow room humidifier size”",
    blurb:
      "Moisture output needed to hold a target RH against air exchange, from room volume and current conditions.",
    tag: "Free",
  },
  {
    slug: "ac-btu",
    name: "AC / BTU sizing",
    category: "Environment & Climate",
    query: "“grow room BTU calculator”",
    blurb:
      "Turn light and equipment wattage into the BTU/hr and tonnage of cooling the room actually needs.",
    tag: "Free",
  },
  {
    slug: "ventilation",
    name: "Exhaust fan & carbon filter CFM",
    category: "Environment & Climate",
    query: "“grow tent fan size calculator”",
    blurb:
      "Room volume and exchange rate → base CFM, derated for carbon filter and ducting so the fan you buy keeps up.",
    tag: "Free",
  },
  {
    slug: "co2",
    name: "CO₂ enrichment calculator",
    category: "Environment & Climate",
    query: "“grow room co2 calculator”",
    blurb:
      "Grams of CO₂ to reach a target ppm, ongoing loss to air exchange, and time-to-setpoint for your injector.",
    tag: "Free",
  },

  // ---- Lighting ----
  {
    slug: "ppfd",
    name: "Grow light coverage & PPFD",
    category: "Lighting",
    query: "“ppfd calculator”",
    blurb:
      "Fixture wattage and efficacy over a coverage area → average PPFD and DLI, checked against stage targets.",
    tag: "Free",
  },

  // ---- Irrigation & Systems ----
  {
    slug: "pump-flow",
    name: "Pump & irrigation flow rate",
    category: "Irrigation & Systems",
    query: "“hydroponic pump size calculator”",
    blurb:
      "Reservoir turnover and emitter demand → the GPH rating to shop for, with head height accounted.",
    tag: "Free",
  },

  // ---- Energy & Economics ----
  {
    slug: "electricity",
    name: "Electricity cost calculator",
    category: "Energy & Economics",
    query: "“grow light electricity cost”",
    blurb:
      "Add up lights, fans, and pumps by wattage and hours → daily, monthly, and per-cycle running cost.",
    tag: "Free",
  },
  {
    slug: "yield",
    name: "Yield estimator & production planner",
    category: "Energy & Economics",
    query: "“hydroponic yield calculator”",
    blurb:
      "Growth rate, area, and cycle length → predicted yield, cycles per year, annual output, and revenue.",
    tag: "Free",
  },
];
