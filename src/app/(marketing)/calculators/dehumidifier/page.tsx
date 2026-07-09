import type { Metadata } from "next";
import { DehumidifierClient } from "./DehumidifierClient";

export const metadata: Metadata = {
  title: "Grow Room & Drying Room Dehumidifier Sizing Calculator (free)",
  description:
    "Size a dehumidifier in pints per day for a grow room (from water fed) or drying room (from wet harvest weight), with a safety factor. Free, no signup.",
  alternates: { canonical: "/calculators/dehumidifier" },
  openGraph: {
    title: "Dehumidifier sizing calculator",
    description: "Pints/day for grow rooms and drying rooms.",
    url: "/calculators/dehumidifier",
  },
};

export default function Page() {
  return <DehumidifierClient />;
}
