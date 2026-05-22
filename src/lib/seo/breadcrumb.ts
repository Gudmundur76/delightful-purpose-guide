// Helper for building BreadcrumbList JSON-LD entries for route head() scripts.
// Usage:
//   scripts: [breadcrumbScript([{ name: "Home", url: "/" }, { name: "Pricing", url: "/pricing" }])]

const BASE_URL = "https://grow.contact";

export interface BreadcrumbItem {
  name: string;
  /** Absolute URL or root-relative path (e.g. "/pricing"). */
  url: string;
}

export function breadcrumbScript(items: BreadcrumbItem[]) {
  return {
    type: "application/ld+json" as const,
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: item.name,
        item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
      })),
    }),
  };
}
