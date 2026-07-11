import type { MetadataRoute } from "next";
import { CALCULATORS, CALCULATORS_LAST_MODIFIED, calcHref } from "@/lib/calculators";

const BASE = "https://hydroponicity.com";

/**
 * Public, index-worthy pages only. The product UI under /app (demo data when
 * signed out) and auth pages are deliberately excluded — the calculators and
 * marketing pages are the organic-traffic surface.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/calculators`, changeFrequency: "weekly", priority: 0.9 },
    ...CALCULATORS.map((t) => ({
      url: `${BASE}${calcHref(t.slug)}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
      lastModified: CALCULATORS_LAST_MODIFIED,
    })),
    { url: `${BASE}/pricing`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
