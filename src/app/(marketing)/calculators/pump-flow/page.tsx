import type { Metadata } from "next";
import { PumpFlowClient } from "./PumpFlowClient";

export const metadata: Metadata = {
  title: "Hydroponic Pump & Irrigation Flow Rate Calculator (free)",
  description:
    "Size a water pump in GPH from reservoir turnover and emitter demand, with head height accounted for. Free, no signup.",
  alternates: { canonical: "/calculators/pump-flow" },
  openGraph: {
    title: "Pump & irrigation flow rate calculator",
    description: "GPH sizing from turnover and emitter demand, with head height.",
    url: "/calculators/pump-flow",
  },
};

export default function Page() {
  return <PumpFlowClient />;
}
