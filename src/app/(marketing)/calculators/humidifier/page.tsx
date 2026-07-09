import type { Metadata } from "next";
import { HumidifierClient } from "./HumidifierClient";

export const metadata: Metadata = {
  title: "Grow Room Humidifier Sizing Calculator (free)",
  description:
    "Calculate the humidifier output (L/day or gal/day) to hold target RH against air exchange, from room size, temperature, and humidity. Free, no signup.",
  alternates: { canonical: "/calculators/humidifier" },
  openGraph: {
    title: "Humidifier sizing calculator",
    description: "Moisture output to hold target RH against air exchange.",
    url: "/calculators/humidifier",
  },
};

export default function Page() {
  return <HumidifierClient />;
}
