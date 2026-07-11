import type { Metadata } from "next";
import { Co2Client } from "./Co2Client";
import { getCalculator } from "@/lib/calculators";
import { CalculatorSeoFooter } from "@/components/marketing/CalculatorSeoFooter";

const calc = getCalculator("co2")!;

export const metadata: Metadata = {
  title: "Grow Room CO₂ Calculator (free)",
  description:
    "Calculate grams of CO₂ to reach a target ppm, ongoing loss to air exchange, time to setpoint, and how long a tank lasts. Free, no signup.",
  keywords: [calc.query, calc.question].filter(Boolean) as string[],
  alternates: { canonical: "/calculators/co2" },
  openGraph: {
    title: "Grow room CO₂ calculator",
    description: "CO₂ mass to setpoint, leakage loss, and tank life.",
    url: "/calculators/co2",
  },
};

export default function Page() {
  return (
    <>
      <Co2Client />
      <CalculatorSeoFooter slug="co2" />
    </>
  );
}
