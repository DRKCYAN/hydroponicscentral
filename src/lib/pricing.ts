/** Real tier names + structure (spec §7/§8). Free / Pro / Retention add-on. */
export interface Tier {
  id: string;
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
  gatedBy: string;
}

export const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    tagline: "Acquisition hooks — the commodity converters, plus one real solve.",
    gatedBy: "Funnel position, not math complexity.",
    features: [
      "EC ↔ ppm / TDS converter (all meter scales)",
      "Fertilizer label decoder (oxide → elemental)",
      "One recipe solve — no save, export, or re-run",
      "All safety warnings & caveats (always free)",
    ],
    cta: "Start free",
    ctaHref: "/calculators/recipe-solver",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$12",
    cadence: "/ month",
    tagline: "The full multi-salt recipe solver bundle, with persistence.",
    gatedBy: "The paid conversion moment.",
    highlighted: true,
    features: [
      "Multi-salt recipe solver (weighted least-squares)",
      "Source-water correction + RO blend guidance",
      "Cation–anion ion balance + EC estimate",
      "Integrated pH / acid dosing",
      "Save, export & re-run recipes across systems",
    ],
    cta: "Go Pro",
    ctaHref: "/app/solver",
  },
  {
    id: "retention",
    name: "Reservoir add-on",
    price: "$8",
    cadence: "/ month or one-time",
    tagline: "Reservoir management & stock-injector scaling for recirculating setups.",
    gatedBy: "Subscription if you recirculate; otherwise a one-time unlock.",
    features: [
      "Stock A/B batch sizing with compatibility rules",
      "Injector / proportioner ratio (convention-aware)",
      "Accumulation tracking (Na, Cl) + dump scheduling",
      "Reservoir refresh-fraction planning",
    ],
    cta: "Add to Pro",
    ctaHref: "/pricing",
  },
];
