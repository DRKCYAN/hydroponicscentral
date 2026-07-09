import type { Metadata } from "next";
import { LabelDecoderClient } from "./LabelDecoderClient";

export const metadata: Metadata = {
  title: "Fertilizer Label Decoder — oxide to elemental (free)",
  description:
    "Convert a guaranteed-analysis N-P-K label (P₂O₅ and K₂O oxides) into the elemental percentages ppm math needs. Free, no signup.",
  alternates: { canonical: "/calculators/label-decoder" },
  openGraph: {
    title: "Fertilizer label decoder (oxide → elemental)",
    description: "Decode P₂O₅ and K₂O into elemental P and K for accurate dosing.",
    url: "/calculators/label-decoder",
  },
};

export default function Page() {
  return <LabelDecoderClient />;
}
