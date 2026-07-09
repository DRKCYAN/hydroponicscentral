import type { Metadata } from "next";
import { VpdClient } from "./VpdClient";

export const metadata: Metadata = {
  title: "VPD Calculator — Vapor Pressure Deficit (free)",
  description:
    "Calculate air and leaf VPD in kPa from temperature, humidity, and leaf offset, checked against veg and flowering targets. Free, no signup.",
  alternates: { canonical: "/calculators/vpd" },
  openGraph: {
    title: "VPD calculator",
    description: "Air and leaf vapor pressure deficit with stage targets.",
    url: "/calculators/vpd",
  },
};

export default function Page() {
  return <VpdClient />;
}
