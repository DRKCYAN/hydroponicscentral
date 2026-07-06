import Link from "next/link";

/** Wordmark. The only place a subtle "leaf" nod is allowed (low-frequency). */
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-600 text-neutral-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 21c0-5 3-8 8-9-1 6-4 9-8 9Zm0 0c0-5-3-8-8-9 1 6 4 9 8 9Zm0 0v-6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-sm font-semibold tracking-tight text-neutral-800">
        Hydroponics<span className="text-accent-600">Hub</span>
      </span>
    </Link>
  );
}
