import type { Metadata } from "next";
import Link from "next/link";
import { CALCULATORS, CALC_CATEGORIES, calcHref } from "@/lib/calculators";
import { Kicker } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Free Hydroponics Calculators: Nutrients, Climate, Lighting & More",
  description:
    "Fourteen free grow-room calculators: nutrient mixing, EC/ppm, VPD, AC and dehumidifier sizing, CO₂, PPFD, electricity cost, and yield. No signup.",
  alternates: { canonical: "/calculators" },
  openGraph: {
    title: "Free hydroponics calculators",
    description:
      "Nutrients, climate, lighting, irrigation, and economics: every grow-room calculation in one place.",
    url: "/calculators",
  },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Kicker>Free tools</Kicker>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
        Hydroponics calculators
      </h1>
      <p className="mt-2 max-w-2xl text-neutral-600">
        Every calculator runs the same engine that powers the Hydroponicity app: real formulas
        with the assumptions stated, free and without signup. Pick the question you&apos;re
        trying to answer.
      </p>

      <div className="mt-10 space-y-10">
        {CALC_CATEGORIES.map((category) => {
          const tools = CALCULATORS.filter((t) => t.category === category);
          if (tools.length === 0) return null;
          return (
            <section key={category}>
              <h2 className="text-lg font-semibold text-neutral-900">{category}</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {tools.map((t) => (
                  <Link
                    key={t.slug}
                    href={calcHref(t.slug)}
                    className="group flex flex-col rounded-xl border border-neutral-200 bg-neutral-0 p-5 transition-colors hover:border-accent-300"
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
                    <p className="mt-1 flex-1 text-sm leading-relaxed text-neutral-500">
                      {t.blurb}
                    </p>
                    {t.query && (
                      <p className="mt-3 text-xs text-neutral-400">Targets {t.query}</p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
