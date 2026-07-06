import Link from "next/link";
import { Logo } from "./Logo";

/** Footer = calculator hub · pricing · about (soon). No dead Marketplace link. */
export function MarketingFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-0">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-neutral-500">
            A precision nutrient calculator for side-hustle growers. Research-grade math, an
            operator-friendly surface.
          </p>
        </div>
        <FooterCol
          title="Free calculators"
          links={[
            ["EC ↔ ppm converter", "/calculators/ec-ppm"],
            ["Fertilizer label decoder", "/calculators/label-decoder"],
            ["Recipe solver", "/calculators/recipe-solver"],
          ]}
        />
        <FooterCol
          title="Product"
          links={[
            ["Pricing", "/pricing"],
            ["Open the app", "/app/dashboard"],
            ["Recipe Solver", "/app/solver"],
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            ["About (soon)", "/about"],
            ["The engine shows its work", "/#trust"],
          ]}
        />
      </div>
      <div className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 py-4 text-xs text-neutral-400 sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} Hydroponics Hub. Skeleton build.</span>
          <span>All safety warnings and approximation caveats are free, always.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={href + label}>
            <Link href={href} className="text-neutral-600 hover:text-accent-700">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
