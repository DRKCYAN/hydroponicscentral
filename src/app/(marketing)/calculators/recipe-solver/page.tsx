import type { Metadata } from "next";
import { RecipeSolver } from "@/components/solver/RecipeSolver";
import { Kicker, CaveatNote } from "@/components/ui/primitives";
import { getCalculator } from "@/lib/calculators";
import { CalculatorSeoFooter } from "@/components/marketing/CalculatorSeoFooter";

const calc = getCalculator("recipe-solver")!;

export const metadata: Metadata = {
  title: "Hydroponic Nutrient Recipe Solver (free)",
  description:
    "Enter target ppm for N, P, K, Ca, Mg and S and get grams of each fertilizer salt to mix: a real multi-salt solve, not single-salt math. One free solve.",
  keywords: [calc.query, calc.question].filter(Boolean) as string[],
  alternates: { canonical: "/calculators/recipe-solver" },
  openGraph: {
    title: "Hydroponic nutrient recipe solver",
    description: "Real multi-salt engine: grams per fertilizer from target ppm, one free solve.",
    url: "/calculators/recipe-solver",
  },
};

export default function RecipeSolverPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="max-w-2xl">
          <Kicker>Free calculator · 1 free solve</Kicker>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
            Hydroponic nutrient recipe solver
          </h1>
          <p className="mt-2 text-neutral-600">
            Pick a crop target (or type your own ppm), choose your salts, and the engine solves how
            many grams of each to weigh out, hitting every element at once. This is the real solver,
            not a demo.
          </p>
        </div>

        <div className="mt-6">
          <CaveatNote tone="info">
            Free tier: one live solve with the full multi-salt engine. Source-water correction, ion
            balance, and saving are Pro, shown below as locked panels so you can see exactly
            what&apos;s behind them.
          </CaveatNote>
        </div>

        <div className="mt-8">
          <RecipeSolver tier="free" />
        </div>
      </div>
      <CalculatorSeoFooter slug="recipe-solver" />
    </>
  );
}
