import Link from "next/link";

/**
 * The calculator hub — three named free tools, each targeting a distinct real
 * query and reachable at its OWN dedicated URL so it can rank independently.
 * The tool IS the content (spec §8).
 */
const TOOLS = [
  {
    href: "/calculators/ec-ppm",
    name: "EC ↔ ppm converter",
    query: "“ec to ppm hydroponics”",
    blurb:
      "Convert between EC and ppm on any meter scale (500 / 640 / 700), with 25 °C temperature correction.",
    tag: "Free",
  },
  {
    href: "/calculators/label-decoder",
    name: "Fertilizer label decoder",
    query: "“convert P2O5 to P”",
    blurb:
      "Turn a guaranteed-analysis N-P-K label (oxide form) into the elemental percentages every ppm calc needs.",
    tag: "Free",
  },
  {
    href: "/calculators/recipe-solver",
    name: "Recipe solver",
    query: "“hydroponic nutrient calculator”",
    blurb:
      "The real multi-salt engine: enter target ppm, get grams per fertilizer and a solved ion balance. One free solve.",
    tag: "1 free solve",
  },
];

export function CalculatorHub() {
  return (
    <div id="calculators" className="grid gap-4 md:grid-cols-3">
      {TOOLS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className="group flex flex-col rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-0 p-5 transition-colors hover:border-accent-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent-600">
              {t.tag}
            </span>
            <span className="text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-500">
              →
            </span>
          </div>
          <h3 className="mt-2 text-base font-semibold text-neutral-900">{t.name}</h3>
          <p className="mt-1 flex-1 text-sm leading-relaxed text-neutral-500">{t.blurb}</p>
          <p className="mt-3 text-xs text-neutral-400">Targets {t.query}</p>
        </Link>
      ))}
    </div>
  );
}
