import type { Metadata } from "next";
import { AcBtuClient } from "./AcBtuClient";

export const metadata: Metadata = {
  title: "Grow Room AC / BTU Sizing Calculator (free)",
  description:
    "Turn grow light and equipment wattage into the BTU/hr and tonnage of AC a grow room needs, with a safety factor and unit suggestions. Free, no signup.",
  alternates: { canonical: "/calculators/ac-btu" },
  openGraph: {
    title: "AC / BTU sizing calculator",
    description: "Cooling load in BTU/hr and tons from equipment wattage.",
    url: "/calculators/ac-btu",
  },
};

export default function Page() {
  return <AcBtuClient />;
}
