import type { Metadata } from "next";
import { HumidifierClient } from "./HumidifierClient";
import { getCalculator } from "@/lib/calculators";
import { CalculatorSeoFooter } from "@/components/marketing/CalculatorSeoFooter";

const calc = getCalculator("humidifier")!;

export const metadata: Metadata = {
  title: "Grow Room Humidifier Sizing Calculator (free)",
  description:
    "Calculate the humidifier output (L/day or gal/day) to hold target RH against air exchange, from room size, temperature, and humidity. Free, no signup.",
  keywords: [calc.query, calc.question].filter(Boolean) as string[],
  alternates: { canonical: "/calculators/humidifier" },
  openGraph: {
    title: "Humidifier sizing calculator",
    description: "Moisture output to hold target RH against air exchange.",
    url: "/calculators/humidifier",
  },
};

export default function Page() {
  return (
    <>
      <HumidifierClient />
      <CalculatorSeoFooter slug="humidifier" />
    </>
  );
}
