/**
 * Gating + provenance primitives.
 * - LockedPanel: the Recipe Solver's "visible-but-locked" pattern — a real
 *   layout state (dimmed panel + unlock CTA), blocked out from the start so it
 *   isn't an expensive retrofit (spec §7).
 * - ProvenanceTrace: a lightweight, collapsed, read-only trace on results.
 *   Uses <details> so it needs no client JS. No graph, no editing (spec §4).
 */
import type { ReactNode } from "react";
import { Kicker } from "./primitives";

export function LockedPanel({
  title,
  tier = "Pro",
  children,
  ctaHref = "/pricing",
}: {
  title: string;
  tier?: string;
  children: ReactNode;
  ctaHref?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-neutral-200">
      {/* dimmed real content behind the lock */}
      <div aria-hidden className="pointer-events-none select-none opacity-40 blur-[1.5px]">
        {children}
      </div>
      {/* lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-0/70 p-4 text-center backdrop-blur-[1px]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-2.5 py-0.5 text-xs font-semibold text-accent-700">
          <LockGlyph /> {tier}
        </span>
        <p className="text-sm font-semibold text-neutral-800">{title}</p>
        <a
          href={ctaHref}
          className="rounded-md bg-accent-600 px-3 py-1.5 text-xs font-medium text-neutral-0 hover:bg-accent-700"
        >
          Unlock with {tier}
        </a>
      </div>
    </div>
  );
}

function LockGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="10" width="16" height="10" rx="2" fill="currentColor" opacity="0.25" />
      <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/** Read-only provenance breadcrumb — "the engine shows its work." */
export function ProvenanceTrace({
  summary,
  steps,
}: {
  summary: ReactNode;
  steps: ReactNode[];
}) {
  return (
    <details className="group rounded-md border border-neutral-200 bg-neutral-50 text-xs">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-neutral-600 marker:content-none">
        <span className="transition-transform group-open:rotate-90" aria-hidden>
          ›
        </span>
        <span className="font-medium">{summary}</span>
        <span className="ml-auto text-neutral-400">trace</span>
      </summary>
      <div className="border-t border-neutral-200 px-3 py-2">
        <ol className="space-y-1 text-neutral-500">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden className="text-neutral-300">
                ←
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </details>
  );
}

/** A small "coming soon" placeholder for architecturally-inert future areas. */
export function ComingSoon({ title, blurb }: { title: string; blurb?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
      <Kicker>Coming soon</Kicker>
      <h2 className="mt-2 text-lg font-semibold text-neutral-700">{title}</h2>
      {blurb && <p className="mt-1 max-w-md text-sm text-neutral-500">{blurb}</p>}
    </div>
  );
}
