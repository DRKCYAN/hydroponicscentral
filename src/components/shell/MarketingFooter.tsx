import Link from "next/link";
import { Logo } from "./Logo";
import { GithubIcon } from "@/components/ui/icons";

const REPO_URL = "https://github.com/DRKCYAN/hydroponicscentral";

/** Footer = calculator hub · pricing · about (soon). No dead Marketplace link. */
export function MarketingFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-0">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-500">
            A precision nutrient calculator for side-hustle growers. Research-grade math, an
            operator-friendly surface.
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Hydroponicity on GitHub"
            className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-800"
          >
            <GithubIcon size={18} />
          </a>
        </div>
        <FooterCol
          title="Free calculators"
          links={[
            ["EC ↔ ppm converter", "/calculators/ec-ppm"],
            ["Recipe solver", "/calculators/recipe-solver"],
            ["VPD calculator", "/calculators/vpd"],
            ["PPFD & DLI calculator", "/calculators/ppfd"],
            ["Electricity cost", "/calculators/electricity"],
            ["All calculators →", "/calculators"],
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
            ["About", "/about"],
            ["The engine shows its work", "/#trust"],
          ]}
        />
      </div>
      <div className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 py-5 text-xs text-neutral-400 sm:flex-row sm:items-center sm:px-6">
          <span>© {new Date().getFullYear()} Hydroponicity</span>
          <span>Safety warnings and approximation caveats are free on every tier.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{title}</h4>
      <ul className="mt-3 space-y-2.5 text-sm">
        {links.map(([label, href]) => (
          <li key={href + label}>
            <Link href={href} className="text-neutral-600 transition-colors hover:text-accent-700">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
