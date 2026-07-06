import Link from "next/link";
import { Logo } from "./Logo";

/** Thin utility strip that replaces the marketing top bar in the product shell. */
export function UtilityStrip() {
  return (
    <div className="flex h-14 items-center justify-between border-b border-neutral-200 bg-neutral-0 px-4">
      <Logo href="/app/dashboard" />
      <div className="flex items-center gap-1 text-sm">
        <Link
          href="/about"
          className="rounded-md px-2.5 py-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
        >
          Help
        </Link>
        <Link
          href="/app/account"
          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-neutral-600 hover:bg-neutral-100"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600">
            SG
          </span>
          <span className="hidden sm:inline">Account</span>
        </Link>
      </div>
    </div>
  );
}
