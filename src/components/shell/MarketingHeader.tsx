import Link from "next/link";
import { Logo } from "./Logo";
import { MobileMarketingMenu } from "./MobileMarketingMenu";

/**
 * Logged-out marketing top bar. Real destinations only — no dead Marketplace
 * link in primary nav until there's content behind it (spec §8/§10).
 */
export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-neutral-0/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 text-sm sm:flex">
          <NavLink href="/#calculators">Calculators</NavLink>
          <NavLink href="/pricing">Pricing</NavLink>
          <NavLink href="/about">About</NavLink>
          <Link
            href="/app/dashboard"
            className="ml-2 rounded-md bg-accent-600 px-3.5 py-1.5 text-sm font-medium text-neutral-0 transition-colors hover:bg-accent-700"
          >
            Open the app
          </Link>
        </nav>
        <MobileMarketingMenu />
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-1.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
    >
      {children}
    </Link>
  );
}
