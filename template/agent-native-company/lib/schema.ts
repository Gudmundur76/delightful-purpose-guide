// JSON-LD generators. Pure functions, server- and client-safe.
import type { Frontmatter, QaPair, PricingRow } from "./content";

export function organizationSchema(f: Frontmatter) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: f.name,
    url: f.website ?? `https://${f.domain}`,
    description: f.description,
    ...(f.logo ? { logo: f.logo } : {}),
    ...(f.founded ? { foundingDate: f.founded } : {}),
    ...(f.team_size ? { numberOfEmployees: f.team_size } : {}),
    ...(f.contact_email ? { email: f.contact_email } : {}),
    ...(f.github ? { sameAs: [f.github] } : {}),
  };
}

export function softwareApplicationSchema(f: Frontmatter, pricing: PricingRow[]) {
  const offers = pricing.map((p) => ({
    "@type": "Offer",
    name: p.tier,
    price: p.price.replace(/[^0-9.]/g, "") || "0",
    priceCurrency: "USD",
    description: p.features,
  }));
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: f.name,
    applicationCategory: f.category ?? "BusinessApplication",
    operatingSystem: "Web",
    description: f.description,
    ...(offers.length ? { offers } : {}),
  };
}

export function faqPageSchema(url: string, pairs: QaPair[]) {
  if (!pairs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url,
    mainEntity: pairs.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };
}
