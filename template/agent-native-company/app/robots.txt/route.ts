import { loadPage } from "@/lib/content";

export const dynamic = "force-static";

export async function GET() {
  const { frontmatter } = loadPage("index");
  // §4 matrix: allow search/citation bots, block training-only bots.
  const body = [
    "User-agent: GPTBot",
    "Disallow: /",
    "",
    "User-agent: Google-Extended",
    "Disallow: /",
    "",
    "User-agent: anthropic-ai",
    "Disallow: /",
    "",
    "User-agent: CCBot",
    "Disallow: /",
    "",
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: https://${frontmatter.domain}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
