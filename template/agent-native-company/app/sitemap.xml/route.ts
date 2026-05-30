import { listPages, loadPage } from "@/lib/content";

export const dynamic = "force-static";

export async function GET() {
  const slugs = listPages();
  const { frontmatter } = loadPage(slugs.includes("index") ? "index" : slugs[0]);
  const base = `https://${frontmatter.domain}`;
  const urls = slugs.map((slug) => {
    const loc = slug === "index" ? `${base}/` : `${base}/${slug}`;
    return `  <url><loc>${loc}</loc></url>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}
