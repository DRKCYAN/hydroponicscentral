import type { Metadata } from "next";
import { EcPpmClient } from "./EcPpmClient";
import { getCalculator } from "@/lib/calculators";
import { CalculatorSeoFooter } from "@/components/marketing/CalculatorSeoFooter";

const calc = getCalculator("ec-ppm")!;

export const metadata: Metadata = {
  title: "EC to ppm / TDS Converter (free)",
  description:
    "Convert between EC and ppm/TDS on any meter scale (500 / 640 / 700) with 25 °C temperature correction. A free, no-signup hydroponics converter.",
  keywords: [calc.query, calc.question].filter(Boolean) as string[],
  alternates: { canonical: "/calculators/ec-ppm" },
  openGraph: {
    title: "EC ↔ ppm / TDS converter",
    description: "Convert EC and ppm on any meter scale, with temperature correction.",
    url: "/calculators/ec-ppm",
  },
};

export default function Page() {
  return (
    <>
      <EcPpmClient />
      <CalculatorSeoFooter slug="ec-ppm" />
    </>
  );
}
