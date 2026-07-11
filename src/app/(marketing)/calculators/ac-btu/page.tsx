import type { Metadata } from "next";
import { AcBtuClient } from "./AcBtuClient";
import { getCalculator } from "@/lib/calculators";
import { CalculatorSeoFooter } from "@/components/marketing/CalculatorSeoFooter";

const calc = getCalculator("ac-btu")!;

export const metadata: Metadata = {
  title: "Grow Room AC / BTU Sizing Calculator (free)",
  description:
    "Turn grow light and equipment wattage into the BTU/hr and tonnage of AC a grow room needs, with a safety factor and unit suggestions. Free, no signup.",
  keywords: [calc.query, calc.question].filter(Boolean) as string[],
  alternates: { canonical: "/calculators/ac-btu" },
  openGraph: {
    title: "AC / BTU sizing calculator",
    description: "Cooling load in BTU/hr and tons from equipment wattage.",
    url: "/calculators/ac-btu",
  },
};

export default function Page() {
  return (
    <>
      <AcBtuClient />
      <CalculatorSeoFooter slug="ac-btu" />
    </>
  );
}
