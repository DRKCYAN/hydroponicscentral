import type { Metadata } from "next";
import { DilutionClient } from "./DilutionClient";

export const metadata: Metadata = {
  title: "Nutrient Dilution & Injector Calculator: C₁V₁ = C₂V₂ (free)",
  description:
    "Solve C₁V₁ = C₂V₂ for any missing value and size stock concentrate for a 1:100 (or any ratio) injector. Free, no signup.",
  alternates: { canonical: "/calculators/dilution" },
  openGraph: {
    title: "Dilution & injector calculator",
    description: "C₁V₁ = C₂V₂ solver plus injector stock-strength sizing.",
    url: "/calculators/dilution",
  },
};

export default function Page() {
  return <DilutionClient />;
}
