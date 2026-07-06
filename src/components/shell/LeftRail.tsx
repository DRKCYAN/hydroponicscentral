"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "./nav-config";

/**
 * Persistent left rail — primary navigation in the logged-in product shell.
 * Groups are workflow verbs; the active route is highlighted with the single
 * muted accent (never a status color).
 */
export function LeftRail() {
  const pathname = usePathname();
  return (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto px-3 py-5">
      {NAV.map((group) => (
        <div key={group.verb}>
          <div className="px-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              {group.verb}
            </div>
            <div className="text-[11px] text-neutral-400/80">{group.question}</div>
          </div>
          <ul className="mt-2 space-y-0.5">
            {group.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                      active
                        ? "bg-accent-50 font-medium text-accent-800"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        active ? "bg-accent-500" : "bg-transparent"
                      }`}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
