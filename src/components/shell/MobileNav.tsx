"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LeftRail } from "./LeftRail";
import { Logo } from "./Logo";
import { MenuIcon, CloseIcon } from "@/components/ui/icons";

/**
 * Mobile navigation for the product shell — a slide-in drawer holding the same
 * left rail. Closes on route change and on Escape, and locks body scroll while
 * open. Desktop keeps the persistent rail; this only appears below `md`.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close when the route changes (a nav item was tapped).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape to close + lock scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100"
      >
        <MenuIcon size={20} />
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-neutral-900/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-neutral-0 shadow-lg transition-transform duration-200 ease-[var(--ease-standard)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-4">
          <Logo href="/app/dashboard" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100"
          >
            <CloseIcon size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <LeftRail />
        </div>
      </div>
    </div>
  );
}
