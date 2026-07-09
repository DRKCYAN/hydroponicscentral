import type { Metadata } from "next";
import { PpfdClient } from "./PpfdClient";

export const metadata: Metadata = {
  title: "Grow Light Coverage, PPFD & DLI Calculator (free)",
  description:
    "Estimate average PPFD and DLI from fixture wattage, efficacy, and coverage area — or the wattage needed for a target PPFD. Free, no signup.",
  alternates: { canonical: "/calculators/ppfd" },
  openGraph: {
    title: "Grow light coverage & PPFD calculator",
    description: "Average PPFD and DLI from wattage, efficacy, and coverage area.",
    url: "/calculators/ppfd",
  },
};

export default function Page() {
  return <PpfdClient />;
}
