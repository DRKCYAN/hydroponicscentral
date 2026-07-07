import type { MetadataRoute } from "next";

const BASE = "https://hydroponicity.com";

/**
 * Public, index-worthy pages only. The product UI under /app (demo data when
 * signed out) and auth pages are deliberately excluded — the calculators and
 * marketing pages are the organic-traffic surface.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/calculators/ec-ppm`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/calculators/label-decoder`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/calculators/recipe-solver`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/pricing`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
