import Link from "next/link";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

/** Thin utility strip that replaces the marketing top bar in the product shell. */
export function UtilityStrip({ email }: { email: string | null }) {
  const initials = email ? email.slice(0, 2).toUpperCase() : null;

  return (
    <div className="flex h-14 items-center justify-between border-b border-neutral-200 bg-neutral-0 px-4">
      <div className="flex items-center gap-1.5">
        <MobileNav />
        <Logo href="/app/dashboard" />
      </div>
      <div className="flex items-center gap-1 text-sm">
        <Link
          href="/about"
          className="rounded-md px-2.5 py-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
        >
          Help
        </Link>
        {email ? (
          <Link
            href="/app/account"
            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-neutral-600 hover:bg-neutral-100"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600">
              {initials}
            </span>
            <span className="hidden sm:inline">Account</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-md bg-accent-600 px-3.5 py-1.5 font-medium text-neutral-0 transition-colors hover:bg-accent-700"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
