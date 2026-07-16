// Per-route head template — copy the head() block into any leaf route file.
// Rule: every leaf route has UNIQUE title/description/og:title/og:description.
// Canonical lives ONLY on leaves (never in __root.tsx — TanStack/router#6719).

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/example")({
  component: ExamplePage,
  head: () => ({
    meta: [
      { title: "Page title — Brand" },
      { name: "description", content: "150-char-ish description that answers the page's implicit question. Numbers and entities." },
      { property: "og:title", content: "Page title — Brand" },
      { property: "og:description", content: "Same as meta description, or a sharper share-optimized variant." },
      { property: "og:url", content: "https://citation.is/example" },
      { property: "og:type", content: "website" }, // "article" / "product" on leaves
      // og:image ONLY at leaves and ONLY when a meaningful image exists:
      // { property: "og:image", content: "https://citation.is/og/example.jpg" },
    ],
    links: [
      { rel: "canonical", href: "https://citation.is/example" },
    ],
    scripts: [
      // Pick the schema.org type matching the page content. Examples:
      //   Article  → blog post  (headline, image, datePublished, author)
      //   Product  → product    (name, image, offers.price, offers.priceCurrency)
      //   FAQPage  → FAQ        (mainEntity: [{ "@type": "Question", name, acceptedAnswer }])
      //   BreadcrumbList → deep route (itemListElement with route ancestry)
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Page title — Brand",
          url: "https://citation.is/example",
        }),
      },
    ],
  }),
});

function ExamplePage() {
  return (
    <main>
      <header>
        <h1>Page title — Brand</h1>
      </header>
      <section>
        {/* First 50–70 words answer the page's implicit question.
            Numbers, dates, named entities. No filler. */}
      </section>
    </main>
  );
}
