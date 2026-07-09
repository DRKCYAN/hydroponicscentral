"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, CloseIcon } from "@/components/ui/icons";

const LINKS: [string, string][] = [
  ["Calculators", "/calculators"],
  ["Pricing", "/pricing"],
  ["About", "/about"],
];

/** Compact dropdown menu for the marketing header on small screens. */
export function MobileMarketingMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100"
      >
        {open ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 top-14 z-30 bg-neutral-900/20" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute inset-x-0 top-14 z-40 border-b border-neutral-200 bg-neutral-0 shadow-lg">
            <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
              {LINKS.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/app/dashboard"
                className="mt-1 rounded-md bg-accent-600 px-3 py-2.5 text-center text-sm font-medium text-neutral-0 hover:bg-accent-700"
              >
                Open the app
              </Link>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
