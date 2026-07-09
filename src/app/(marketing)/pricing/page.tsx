import type { Metadata } from "next";
import { PricingTable } from "@/components/marketing/PricingTable";
import { Kicker, CaveatNote } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Pricing — Free, Pro & Reservoir add-on",
  description:
    "Free calculators, a Pro multi-salt recipe solver with persistence, and a reservoir add-on for recirculating systems. Simple monthly pricing.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <Kicker>Pricing</Kicker>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
          Simple tiers, gated by funnel position
        </h1>
        <p className="mt-3 text-neutral-600">
          The free tools are genuinely useful on their own. Pro unlocks the full solver bundle with
          persistence. The reservoir add-on is for growers who recirculate.
        </p>
      </div>
      <div className="mt-10">
        <PricingTable />
      </div>
      <div className="mx-auto mt-8 max-w-2xl">
        <CaveatNote tone="info">
          All safety warnings (stock incompatibility, chelate–pH matching) and approximation caveats
          are free and always visible, on every tier. They travel with their feature into whatever
          tier it occupies.
        </CaveatNote>
      </div>
    </div>
  );
}
