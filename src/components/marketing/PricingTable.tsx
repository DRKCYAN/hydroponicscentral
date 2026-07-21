import Link from "next/link";
import { TIERS } from "@/lib/pricing";
import { CheckIcon } from "@/components/ui/icons";

/** Real tier names + structure (free / pro / retention add-on) — not a teaser. */
export function PricingTable() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {TIERS.map((tier) => (
        <div
          key={tier.id}
          className={`flex flex-col rounded-xl border bg-neutral-0 p-6 ${
            tier.highlighted ? "border-accent-400 ring-1 ring-accent-200" : "border-neutral-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-800">{tier.name}</h3>
            {tier.highlighted && (
              <span className="rounded-full bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-700">
                Most complete
              </span>
            )}
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="num text-3xl font-semibold text-neutral-900">{tier.price}</span>
            <span className="text-sm text-neutral-500">{tier.cadence}</span>
          </div>
          <p className="mt-2 text-sm text-neutral-500">{tier.tagline}</p>
          <ul className="mt-4 flex-1 space-y-2.5 text-sm text-neutral-600">
            {tier.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 text-accent-600">
                  <CheckIcon size={16} />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-neutral-400">{tier.gatedBy}</p>
          <Link
            href={tier.ctaHref}
            className={`mt-4 rounded-md px-4 py-2 text-center text-sm font-medium ${
              tier.highlighted
                ? "bg-accent-600 text-neutral-0 hover:bg-accent-700"
                : "border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            {tier.cta}
          </Link>
        </div>
      ))}
    </div>
  );
}
