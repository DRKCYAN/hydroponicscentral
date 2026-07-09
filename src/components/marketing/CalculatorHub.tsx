"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CALCULATORS, calcHref } from "@/lib/calculators";

/** Card width (w-72 = 288px) and gap (gap-4 = 16px) the slide math relies on. */
const CARD_W = 288;
const GAP = 16;
const STEP = CARD_W + GAP;

/**
 * The calculator hub — all 14 tools in a button-driven carousel, each
 * reachable at its OWN dedicated URL so it can rank independently (spec §8).
 * Paging slides the track with a CSS transform; no scroll container, so it
 * behaves identically with mouse, touch, and keyboard. Every card stays in
 * the server-rendered HTML for crawlers. The full list lives at /calculators.
 */
export function CalculatorHub() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(3);

  useEffect(() => {
    function measure() {
      const w = viewportRef.current?.clientWidth ?? 0;
      setPerView(Math.max(1, Math.floor((w + GAP) / STEP)));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const maxIndex = Math.max(0, CALCULATORS.length - perView);
  const current = Math.min(index, maxIndex);
  const pages = Math.ceil(CALCULATORS.length / perView);
  const currentPage = current >= maxIndex ? pages - 1 : Math.round(current / perView);

  const goTo = (i: number) => setIndex(Math.max(0, Math.min(i, maxIndex)));

  return (
    <div id="calculators">
      <div className="relative">
        <div ref={viewportRef} className="overflow-hidden py-1">
          <div
            className="flex gap-4 transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${current * STEP}px)` }}
          >
            {CALCULATORS.map((t) => (
              <Link
                key={t.slug}
                href={calcHref(t.slug)}
                className="group flex w-72 shrink-0 flex-col rounded-xl border border-neutral-200 bg-neutral-0 p-5 transition-colors hover:border-accent-300"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-semibold uppercase tracking-wider text-accent-600">
                    {t.category}
                  </span>
                  <span className="text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-500">
                    →
                  </span>
                </div>
                <h3 className="mt-2 text-base font-semibold text-neutral-900">{t.name}</h3>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-neutral-500">{t.blurb}</p>
                {t.query && <p className="mt-3 text-xs text-neutral-400">Targets {t.query}</p>}
              </Link>
            ))}
          </div>
        </div>

        <CarouselArrow
          dir={-1}
          disabled={current === 0}
          onClick={() => goTo(current - perView)}
        />
        <CarouselArrow
          dir={1}
          disabled={current >= maxIndex}
          onClick={() => goTo(current + perView)}
        />
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {Array.from({ length: pages }).map((_, p) => (
          <button
            key={p}
            type="button"
            aria-label={`Go to calculators page ${p + 1}`}
            aria-current={p === currentPage ? "true" : undefined}
            onClick={() => goTo(p * perView)}
            className={`h-2 rounded-full transition-all ${
              p === currentPage
                ? "w-5 bg-accent-600"
                : "w-2 bg-neutral-300 hover:bg-neutral-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function CarouselArrow({
  dir,
  disabled,
  onClick,
}: {
  dir: 1 | -1;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={dir === 1 ? "Next calculators" : "Previous calculators"}
      disabled={disabled}
      onClick={onClick}
      className={`absolute top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-neutral-0 text-neutral-600 shadow-sm transition-opacity hover:text-neutral-900 disabled:cursor-default disabled:opacity-30 ${
        dir === 1 ? "-right-3" : "-left-3"
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {dir === 1 ? <path d="m9 18 6-6-6-6" /> : <path d="m15 18-6-6 6-6" />}
      </svg>
    </button>
  );
}
