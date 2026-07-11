import type { Metadata } from "next";
import { YieldEstimatorClient } from "./YieldEstimatorClient";
import { getCalculator } from "@/lib/calculators";
import { CalculatorSeoFooter } from "@/components/marketing/CalculatorSeoFooter";

const calc = getCalculator("yield")!;

export const metadata: Metadata = {
  title: "Hydroponic Yield Estimator & Production Planner (free)",
  description:
    "Estimate yield per cycle from growth rate, area, and harvest index, then plan cycles per year, annual production, and revenue. Free, no signup.",
  keywords: [calc.query, calc.question].filter(Boolean) as string[],
  alternates: { canonical: "/calculators/yield" },
  openGraph: {
    title: "Yield estimator & production planner",
    description: "Predicted yield, cycles per year, annual output, and revenue.",
    url: "/calculators/yield",
  },
};

export default function Page() {
  return (
    <>
      <YieldEstimatorClient />
      <CalculatorSeoFooter slug="yield" />
    </>
  );
}
