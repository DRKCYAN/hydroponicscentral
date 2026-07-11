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
  /** Natural-language question this tool should rank for (on-page H2 + FAQ schema). */
  question?: string;
  /** ~40-70 word direct prose answer. Rendered as visible FAQ copy and FAQPage JSON-LD text. */
  answer?: string;
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

export function getCalculator(slug: string): CalcEntry | undefined {
  return CALCULATORS.find((c) => c.slug === slug);
}

/**
 * Same-category siblings first; pads from the rest of the registry (in
 * declared order) when a category has fewer than `max` other members.
 * Needed because Lighting (ppfd) and Irrigation & Systems (pump-flow) are
 * currently single-calculator categories.
 */
export function getRelatedCalculators(slug: string, max = 3): CalcEntry[] {
  const self = getCalculator(slug);
  if (!self) return [];
  const sameCategory = CALCULATORS.filter(
    (c) => c.slug !== slug && c.category === self.category
  );
  if (sameCategory.length >= max) return sameCategory.slice(0, max);
  const rest = CALCULATORS.filter(
    (c) => c.slug !== slug && c.category !== self.category
  );
  return [...sameCategory, ...rest].slice(0, max);
}

/** Bumped only when calculator content/schema genuinely changes site-wide. */
export const CALCULATORS_LAST_MODIFIED = new Date("2026-07-10");

export const CALCULATORS: CalcEntry[] = [
  // ---- Nutrients & Water ----
  {
    slug: "ec-ppm",
    name: "EC ↔ ppm converter",
    category: "Nutrients & Water",
    query: "“ec to ppm hydroponics”",
    question: "How do you convert EC to ppm in hydroponics?",
    answer:
      "Multiply EC (mS/cm) by your meter's conversion factor: 500 for the 500 scale, 640 for 640, or 700 for the Australian/NaCl scale. A reading of 1.8 mS/cm is about 900 ppm on the 500 scale but 1,260 ppm on the 700 scale, so always check which scale your meter uses before comparing readings. Use the calculator above to convert either direction with temperature correction.",
    blurb:
      "Convert between EC and ppm on any meter scale (500 / 640 / 700), with 25 °C temperature correction.",
    tag: "Free",
  },
  {
    slug: "label-decoder",
    name: "Fertilizer label decoder",
    category: "Nutrients & Water",
    query: "“convert P2O5 to P”",
    question: "How do you convert P2O5 and K2O on a fertilizer label to elemental P and K?",
    answer:
      "Multiply the label's P2O5 percentage by 0.436 to get elemental phosphorus, and multiply K2O by 0.830 to get elemental potassium, since fertilizer labels report phosphorus and potassium in oxide form, not as the raw element your nutrient math needs. Nitrogen on the label is already elemental, so no conversion applies there. Enter your guaranteed analysis above for exact elemental percentages.",
    blurb:
      "Turn a guaranteed-analysis N-P-K label (oxide form) into the elemental percentages every ppm calc needs.",
    tag: "Free",
  },
  {
    slug: "recipe-solver",
    name: "Recipe solver",
    category: "Nutrients & Water",
    query: "“hydroponic nutrient calculator”",
    question: "What is the best hydroponic nutrient calculator for mixing multiple fertilizer salts?",
    answer:
      "A true multi-salt solver takes your target ppm for N, P, K, Ca, Mg, and S and solves simultaneously for grams of each fertilizer salt, so every element lands on target at once instead of chasing one number at a time the way single-salt math does. Enter your targets and salts above for one free solve with a full ion balance.",
    blurb:
      "The real multi-salt engine: enter target ppm, get grams per fertilizer and a solved ion balance. One free solve.",
    tag: "1 free solve",
  },
  {
    slug: "dilution",
    name: "Dilution & injector calculator",
    category: "Nutrients & Water",
    query: "“nutrient dilution calculator”",
    question: "How do you calculate nutrient dilution for a hydroponic injector?",
    answer:
      "Use C₁V₁ = C₂V₂: multiply your stock concentration by its volume, then divide by the target concentration to find how much water to add. For injectors, size your stock concentrate at the injector's ratio (e.g. 1:100) times your target feed strength. Enter any three known values above to solve for the fourth.",
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
    question: "What is a good VPD for hydroponics?",
    answer:
      "Target 0.4-0.8 kPa during veg and 0.8-1.2 kPa during flower, measured as leaf VPD when possible. Going below the range risks mold and poor transpiration; going above it stresses plants and slows growth. Enter your temp, humidity, and leaf offset above to check your room against these stage targets.",
    blurb:
      "Air temp, humidity, and leaf-temperature offset → air and leaf VPD in kPa, checked against stage targets.",
    tag: "Free",
  },
  {
    slug: "dehumidifier",
    name: "Dehumidifier sizing",
    category: "Environment & Climate",
    query: "“grow room dehumidifier size”",
    question: "How do you size a dehumidifier for a grow room?",
    answer:
      "Estimate pints-per-day capacity from how much water your plants transpire, roughly equal to what you feed them, plus moisture gained through air exchange, then add a safety margin in humid climates. A drying room instead needs capacity sized off wet harvest weight, since freshly cut plants release most of their moisture in the first week. Enter your room and grow details above for an exact target.",
    blurb:
      "Pints-per-day capacity for a grow room (from water fed) or a drying room (from wet harvest weight).",
    tag: "Free",
  },
  {
    slug: "humidifier",
    name: "Humidifier sizing",
    category: "Environment & Climate",
    query: "“grow room humidifier size”",
    question: "How do you size a humidifier for a grow room?",
    answer:
      "Calculate the moisture output needed to hold your target relative humidity against air-exchange losses, using room volume, current RH, and target RH. Undersized units cycle constantly and still lose ground during lights-on, when moisture demand is highest. Enter your room conditions above to get the output rating to shop for.",
    blurb:
      "Moisture output needed to hold a target RH against air exchange, from room volume and current conditions.",
    tag: "Free",
  },
  {
    slug: "ac-btu",
    name: "AC / BTU sizing",
    category: "Environment & Climate",
    query: "“grow room BTU calculator”",
    question: "How many BTUs do I need to cool a grow room?",
    answer:
      "Add up the wattage of your lights and equipment, convert to BTU/hr at roughly watts × 3.41, then size an AC unit with headroom for ambient heat gain and duct losses. Undersizing is the most common mistake, since grow lights run a near-constant heat load unlike a bedroom AC that cycles off. Enter your equipment wattage above for exact BTU/hr and tonnage.",
    blurb:
      "Turn light and equipment wattage into the BTU/hr and tonnage of cooling the room actually needs.",
    tag: "Free",
  },
  {
    slug: "ventilation",
    name: "Exhaust fan & carbon filter CFM",
    category: "Environment & Climate",
    query: "“grow tent fan size calculator”",
    question: "What size exhaust fan do I need for a grow tent?",
    answer:
      "Calculate base CFM from your room volume times your target air exchanges per minute, then derate for the static pressure a carbon filter and ducting add, since a filter typically cuts rated CFM by 25-45%. Buying a fan rated at your raw CFM need, with no derating, is the most common undersizing mistake. Enter your room and filter setup above for the CFM to actually shop for.",
    blurb:
      "Room volume and exchange rate → base CFM, derated for carbon filter and ducting so the fan you buy keeps up.",
    tag: "Free",
  },
  {
    slug: "co2",
    name: "CO₂ enrichment calculator",
    category: "Environment & Climate",
    query: "“grow room co2 calculator”",
    question: "How much CO2 do you need to enrich a grow room?",
    answer:
      "Calculate grams of CO2 needed to raise your room from ambient (about 420 ppm) to a target like 1,200-1,500 ppm based on room volume, then account for ongoing loss to air exchange to size your injector's continuous output. Sealed rooms need far less CO2 per hour than vented ones, since every air exchange purges enrichment. Enter your room and target ppm above for grams needed and time-to-setpoint.",
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
    question: "What PPFD do you need for hydroponic growing?",
    answer:
      "Target roughly 200-400 μmol/m²/s PPFD for vegetative growth and 600-900+ for flowering, though exact targets depend on crop and CO2 level. PPFD comes from your fixture's wattage and efficacy (μmol/J) spread over your coverage area, and DLI (daily light integral) multiplies that by photoperiod. Enter your fixture and coverage area above to check both against stage targets.",
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
    question: "How do you size a water pump for a hydroponic system?",
    answer:
      "Add your reservoir's target turnover rate (how many times per hour you want to cycle the full volume) to your emitters' combined demand at full flow, then account for head height, since every foot of vertical lift reduces a pump's effective GPH. Undersized pumps starve the highest emitters first. Enter your reservoir size and emitter count above for the GPH rating to shop for.",
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
    question: "How much electricity does a hydroponic grow light use per month?",
    answer:
      "A typical 600W LED run 18 hours a day draws about 10.8 kWh daily, or roughly 324 kWh a month. Multiply that by your utility rate to get cost, then add fans, pumps, and any AC load for the full picture. Use the calculator above to total your exact setup and see daily, monthly, and per-cycle cost.",
    blurb:
      "Add up lights, fans, and pumps by wattage and hours → daily, monthly, and per-cycle running cost.",
    tag: "Free",
  },
  {
    slug: "yield",
    name: "Yield estimator & production planner",
    category: "Energy & Economics",
    query: "“hydroponic yield calculator”",
    question: "How do you estimate hydroponic yield before harvest?",
    answer:
      "Multiply your canopy area by an expected yield-per-square-foot rate for your crop and light intensity, then multiply by cycles per year for annual output and revenue. Your growth-rate assumption matters more than any other input, so start conservative and adjust from real harvest data. Enter your area, cycle length, and rate above for a full production and revenue estimate.",
    blurb:
      "Growth rate, area, and cycle length → predicted yield, cycles per year, annual output, and revenue.",
    tag: "Free",
  },
];
