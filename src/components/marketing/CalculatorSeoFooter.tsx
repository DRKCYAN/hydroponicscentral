import Link from "next/link";
import { calcHref, getCalculator, getRelatedCalculators } from "@/lib/calculators";

const SITE = "https://hydroponicity.com";

/**
 * SoftwareApplication + BreadcrumbList always, FAQPage only once question/answer
 * copy exists for the slug. Escaping `<` prevents the JSON payload from ever
 * being able to close the surrounding <script> tag.
 */
export function CalculatorJsonLd({ slug }: { slug: string }) {
  const calc = getCalculator(slug);
  if (!calc) return null;
  const url = `${SITE}${calcHref(slug)}`;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "SoftwareApplication",
      name: calc.name,
      description: calc.blurb,
      applicationCategory: "UtilitiesApplication",
      url,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        { "@type": "ListItem", position: 2, name: "Calculators", item: `${SITE}/calculators` },
        { "@type": "ListItem", position: 3, name: calc.name, item: url },
      ],
    },
  ];

  if (calc.question && calc.answer) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: calc.question,
          acceptedAnswer: { "@type": "Answer", text: calc.answer },
        },
      ],
    });
  }

  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
    /</g,
    "\\u003c"
  );

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

/** Server-rendered so crawlers see the FAQ content and JSON-LD in the static HTML. */
export function CalculatorSeoFooter({ slug }: { slug: string }) {
  const calc = getCalculator(slug);
  if (!calc) return null;
  const related = getRelatedCalculators(slug, 3);

  return (
    <>
      <CalculatorJsonLd slug={slug} />
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        {calc.question && calc.answer && (
          <div className="border-t border-neutral-200 pt-8">
            <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
              {calc.question}
            </h2>
            <p className="mt-2 text-neutral-600">{calc.answer}</p>
          </div>
        )}
        {related.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Related calculators
            </h3>
            <ul className="mt-3 flex flex-wrap gap-3 text-sm">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={calcHref(r.slug)}
                    className="font-medium text-accent-700 hover:underline"
                  >
                    {r.name} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
