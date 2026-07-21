import Link from "next/link";
import { CalculatorHub } from "@/components/marketing/CalculatorHub";
import { CALCULATORS } from "@/lib/calculators";
import { PricingTable } from "@/components/marketing/PricingTable";
import { Kicker, CaveatNote } from "@/components/ui/primitives";
import { CheckIcon } from "@/components/ui/icons";

/**
 * Homepage — keyword-driven, SEO-oriented. Its job: route people into the free
 * calculators as fast as possible. Section stack per spec §8.
 */
export default function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <section className="border-b border-neutral-200 bg-gradient-to-b from-neutral-0 to-neutral-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="max-w-3xl">
            <Kicker>Hydroponics nutrient calculator</Kicker>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
              Hydroponics <span className="text-accent-600">pays</span>.{" "}
              <span className="block">The chemistry is what kills it.</span>
            </h1>
            <div className="mt-4 max-w-2xl space-y-3 text-base leading-relaxed text-neutral-600">
              <p>
                A spare tent and a couple of reservoirs can out-produce a backyard plot several
                times over; that&apos;s how hydroponics pays: basil sold to restaurants,
                strawberries in a garage through winter, lettuce turning over every three weeks.
                Then the plants yellow, curl, and stall, and the water chemistry that kills them
                never shows up on the bottle label.
              </p>
              <p>
                The label assumes distilled water; yours already has calcium and alkalinity in it.
                It never warns you that calcium and sulfate in one stock tank turn expensive
                nutrients into sludge, or that iron quietly stops working above pH 6.5.{" "}
                <span className="font-medium text-neutral-900">
                  None of this is hard. It&apos;s just invisible, until something dies.
                </span>
              </p>
              <p>
                Hydroponicity is the hydroponics nutrient calculator built for side-hustle
                growers. Tell it
                your water, your salts, and what you&apos;re growing, and it solves the exact grams
                of each fertilizer, corrected for your tap, checked for precipitation, matched to
                your pH. You get a number you can trust and the reason it&apos;s right.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/calculators/recipe-solver"
                className="rounded-md bg-accent-600 px-5 py-2.5 text-sm font-medium text-neutral-0 hover:bg-accent-700"
              >
                Solve a recipe free →
              </Link>
              <Link
                href="#calculators"
                className="rounded-md border border-neutral-300 bg-neutral-0 px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Browse the free tools
              </Link>
            </div>
            <p className="mt-4 text-xs text-neutral-400">
              No account needed for the free calculators. The engine keeps the full math intact.
              The surface just hides what you don&apos;t need day to day.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Calculator hub */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <Kicker>Free tools</Kicker>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
              Start with a calculator
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              Each tool solves one real problem and lives at its own URL. No sign-up to try them.
            </p>
          </div>
          <Link
            href="/calculators"
            className="shrink-0 text-sm font-medium text-accent-700 hover:underline"
          >
            All {CALCULATORS.length} calculators →
          </Link>
        </div>
        <CalculatorHub />
      </section>

      {/* 3. Feature highlights */}
      <section className="border-y border-neutral-200 bg-neutral-0">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <Kicker>Why it&apos;s different</Kicker>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
            Research-grade math, an operator-friendly surface
          </h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <Feature
              title="Multi-salt recipe engine"
              body="Not a stack of single-salt calculators: a constrained weighted least-squares solve across every fertilizer at once, so one salt's contribution to K doesn't wreck your Mg."
            />
            <Feature
              title="Reservoir & system tracking"
              body="Every system carries its own state: active recipe, water source, last reading. Log an EC/pH reading and it's compared against that system's target automatically."
            />
            <Feature
              title="Advanced, yet simple"
              body="The full engine (source-water correction, ion balance, EC estimate, pH dosing) stays intact underneath. The UI exposes only what a side-hustle grower uses day to day."
            />
          </div>
        </div>
      </section>

      {/* 4. Trust signal */}
      <section id="trust" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <Kicker>Trust</Kicker>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
              The engine shows its work
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              A missed EC or pH warning is a real dosing error, so safety warnings and
              approximation caveats are always free and always visible, regardless of tier. Every
              result traces back to its inputs, so you can verify the math before you weigh
              anything out.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-neutral-600">
              {[
                "Safety warnings never sit behind a paywall",
                "A collapsible provenance trace on every result",
                "Units shown next to every number: no unit hidden in a tooltip",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-accent-600">
                    <CheckIcon size={16} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {/* provenance mockup */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-0 p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-neutral-700">Dosing</span>
              <span className="num text-lg font-semibold text-neutral-900">
                4.2 <span className="text-xs font-medium text-neutral-500">g CaNO₃</span>
              </span>
            </div>
            <div className="mt-3 space-y-1.5 border-t border-neutral-200 pt-3 text-xs text-neutral-500">
              <div className="flex gap-2">
                <span className="text-neutral-300">←</span> recipe solved Jun 3
              </div>
              <div className="flex gap-2">
                <span className="text-neutral-300">←</span> targets: N 150 ppm, Ca 180 ppm
              </div>
              <div className="flex gap-2">
                <span className="text-neutral-300">←</span> water: Well A (corrected)
              </div>
            </div>
            <div className="mt-4">
              <CaveatNote>
                Keep calcium and sulfate in separate stock tanks: they precipitate as gypsum when
                concentrated.
              </CaveatNote>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pricing */}
      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <Kicker>Pricing</Kicker>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
                Gated by where you are, not how hard the math is
              </h2>
            </div>
            <Link href="/pricing" className="text-sm font-medium text-accent-700 hover:underline">
              Full pricing →
            </Link>
          </div>
          <PricingTable />
        </div>
      </section>
    </>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">{body}</p>
    </div>
  );
}
