// Public JSON endpoint for a single glossary term. Open / no API key.
// Mirrors the on-page DefinedTerm JSON-LD so AI engines can fetch the
// canonical machine-readable version directly.
import { createFileRoute } from "@tanstack/react-router";
import { CORS_HEADERS } from "@/lib/api/auth";
import { GLOSSARY } from "@/lib/glossary/data";

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, max-age=3600",
  ...CORS_HEADERS,
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), { status, headers: JSON_HEADERS });
}

export const Route = createFileRoute("/api/public/v1/glossary/{$term}.json")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: CORS_HEADERS }),
      GET: async ({ params }) => {
        const termSlug = (params as { term: string }).term;
        const entry =
          GLOSSARY.find((g) => g.slug === termSlug) ||
          GLOSSARY.find(
            (g) =>
              g.term.toLowerCase() === termSlug.toLowerCase() ||
              g.aliases?.some(
                (a) => a.toLowerCase() === termSlug.toLowerCase(),
              ),
          );

        if (!entry) return json({ error: "Glossary term not found", term: termSlug }, 404);

        const url = `https://citation.is/glossary/${entry.slug}`;
        const related = (entry.related ?? [])
          .map((slug) => GLOSSARY.find((g) => g.slug === slug))
          .filter(Boolean)
          .map((g) => ({
            slug: g!.slug,
            term: g!.term,
            url: `https://citation.is/glossary/${g!.slug}`,
          }));

        return json({
          term: entry.term,
          slug: entry.slug,
          definition: entry.short,
          long_definition: entry.long,
          category: entry.category,
          aliases: entry.aliases ?? [],
          examples: entry.sources ?? [],
          related_terms: related,
          url,
          schema: {
            "@context": "https://schema.org",
            "@type": "DefinedTerm",
            name: entry.term,
            alternateName: entry.aliases ?? undefined,
            description: entry.short,
            url,
            inDefinedTermSet: {
              "@type": "DefinedTermSet",
              name: "citation.is GEO Glossary",
              url: "https://citation.is/glossary",
            },
          },
        });
      },
    },
  },
});
