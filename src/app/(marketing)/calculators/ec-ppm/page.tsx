import type { Metadata } from "next";
import { EcPpmClient } from "./EcPpmClient";

export const metadata: Metadata = {
  title: "EC to ppm / TDS Converter (free)",
  description:
    "Convert between EC and ppm/TDS on any meter scale (500 / 640 / 700) with 25 °C temperature correction. A free, no-signup hydroponics converter.",
  alternates: { canonical: "/calculators/ec-ppm" },
  openGraph: {
    title: "EC ↔ ppm / TDS converter",
    description: "Convert EC and ppm on any meter scale, with temperature correction.",
    url: "/calculators/ec-ppm",
  },
};

export default function Page() {
  return <EcPpmClient />;
}
