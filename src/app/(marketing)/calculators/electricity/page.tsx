import type { Metadata } from "next";
import { ElectricityClient } from "./ElectricityClient";

export const metadata: Metadata = {
  title: "Grow Room Electricity Cost Calculator (free)",
  description:
    "Add up grow lights, fans, and pumps by wattage and hours per day for daily, monthly, and per-cycle electricity cost, plus AC load. Free, no signup.",
  alternates: { canonical: "/calculators/electricity" },
  openGraph: {
    title: "Grow room electricity cost calculator",
    description: "Daily, monthly, and per-cycle running cost from device wattages.",
    url: "/calculators/electricity",
  },
};

export default function Page() {
  return <ElectricityClient />;
}
