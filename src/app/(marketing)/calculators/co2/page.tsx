import type { Metadata } from "next";
import { Co2Client } from "./Co2Client";

export const metadata: Metadata = {
  title: "Grow Room CO₂ Calculator (free)",
  description:
    "Calculate grams of CO₂ to reach a target ppm, ongoing loss to air exchange, time to setpoint, and how long a tank lasts. Free, no signup.",
  alternates: { canonical: "/calculators/co2" },
  openGraph: {
    title: "Grow room CO₂ calculator",
    description: "CO₂ mass to setpoint, leakage loss, and tank life.",
    url: "/calculators/co2",
  },
};

export default function Page() {
  return <Co2Client />;
}
