// Add inside createRootRoute({ ... }) in src/routes/__root.tsx.
// Sitewide defaults ONLY — never per-page title/description, never canonical.

head: () => ({
  meta: [
    { charSet: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { title: "Brand — Tagline" }, // overridden per route via meta
    { name: "description", content: "Sitewide fallback description." },
    { property: "og:site_name", content: "Brand" },
    { property: "og:type", content: "website" },
    // Build-stamp the standard version (grandfathered if standard bumps later):
    { name: "generator", content: "geo-standard@2026.05" },
  ],
  links: [
    // NO canonical here — TanStack concatenates links without dedup (router#6719).
    // Canonical lives on leaves only.
  ],
  scripts: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Brand",
        url: "https://grow.contact",
        logo: "https://grow.contact/logo.png",
        sameAs: [
          // "https://twitter.com/brand",
          // "https://linkedin.com/company/brand",
        ],
      }),
    },
  ],
}),
