// Helper for building per-route og:image / twitter:image meta entries.
// Points at the dynamic SVG endpoint /api/public/widget/og.svg so every
// leaf route gets a unique preview image without inheriting the home
// page's image.

export function ogImageUrl(opts: { title: string; kicker?: string; sub?: string }): string {
  const params = new URLSearchParams();
  params.set("title", opts.title);
  if (opts.kicker) params.set("kicker", opts.kicker);
  if (opts.sub) params.set("sub", opts.sub);
  return `https://grow.contact/api/public/widget/og.svg?${params.toString()}`;
}

export function ogImageMeta(opts: {
  title: string;
  description?: string;
  kicker?: string;
  sub?: string;
}): Array<{ property?: string; name?: string; content: string }> {
  const url = ogImageUrl({ title: opts.title, kicker: opts.kicker, sub: opts.sub ?? opts.description });
  return [
    { property: "og:image", content: url },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: opts.title },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: url },
  ];
}
