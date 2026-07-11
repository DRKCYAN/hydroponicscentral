import type { Metadata } from "next";
import { DehumidifierClient } from "./DehumidifierClient";
import { getCalculator } from "@/lib/calculators";
import { CalculatorSeoFooter } from "@/components/marketing/CalculatorSeoFooter";

const calc = getCalculator("dehumidifier")!;

export const metadata: Metadata = {
  title: "Grow Room & Drying Room Dehumidifier Sizing Calculator (free)",
  description:
    "Size a dehumidifier in pints per day for a grow room (from water fed) or drying room (from wet harvest weight), with a safety factor. Free, no signup.",
  keywords: [calc.query, calc.question].filter(Boolean) as string[],
  alternates: { canonical: "/calculators/dehumidifier" },
  openGraph: {
    title: "Dehumidifier sizing calculator",
    description: "Pints/day for grow rooms and drying rooms.",
    url: "/calculators/dehumidifier",
  },
};

export default function Page() {
  return (
    <>
      <DehumidifierClient />
      <CalculatorSeoFooter slug="dehumidifier" />
    </>
  );
}
