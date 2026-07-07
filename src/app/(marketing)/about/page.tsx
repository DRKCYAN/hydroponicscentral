import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/feature";
import { Kicker } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "About",
  description: "About Hydroponicity — a precision nutrient calculator for side-hustle growers.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Kicker>About</Kicker>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
        Built for side-hustle growers
      </h1>
      <p className="mt-3 text-neutral-600">
        Hydroponicity surfaces a sophisticated calculation engine — recipe solving, EC/pH/dosing,
        reservoir management — through a clean, operational interface. The principle: don&apos;t
        simplify the engine, simplify the surface.
      </p>
      <div className="mt-10">
        <ComingSoon
          title="The full About page is on the way"
          blurb="Team, methodology, and the reference behind the engine. This is a structural placeholder — no dead links in primary nav."
        />
      </div>
    </div>
  );
}
