import type { Metadata } from "next";
import { VentilationClient } from "./VentilationClient";

export const metadata: Metadata = {
  title: "Grow Room Ventilation & Carbon Filter CFM Calculator (free)",
  description:
    "Size an exhaust fan and carbon filter in CFM from room volume and exchange rate, derated for filter and ducting losses. Free, no signup.",
  alternates: { canonical: "/calculators/ventilation" },
  openGraph: {
    title: "Ventilation & carbon filter CFM calculator",
    description: "Exhaust fan CFM with filter and ducting derating.",
    url: "/calculators/ventilation",
  },
};

export default function Page() {
  return <VentilationClient />;
}
