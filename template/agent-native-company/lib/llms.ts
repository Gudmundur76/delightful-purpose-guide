// Build a structured llms.txt from all MDX pages.
import { listPages, loadPage, extractPricing, type Frontmatter } from "./content";

export function buildLlmsTxt(): string {
  const slugs = listPages();
  if (!slugs.length) return "# (empty)\n";

  const home = loadPage(slugs.includes("index") ? "index" : slugs[0]);
  const f: Frontmatter = home.frontmatter;
  const lines: string[] = [];

  lines.push(`# ${f.name}`, "", `> ${f.description}`, "");

  lines.push("## Overview");
  lines.push(`- Domain: https://${f.domain}`);
  if (f.category) lines.push(`- Category: ${f.category}`);
  if (f.founded) lines.push(`- Founded: ${f.founded}`);
  if (f.team_size) lines.push(`- Team size: ${f.team_size}`);
  if (f.contact_email) lines.push(`- Contact: ${f.contact_email}`);
  lines.push("");

  lines.push("## Pages");
  for (const slug of slugs) {
    const p = loadPage(slug);
    const url = slug === "index" ? `https://${f.domain}/` : `https://${f.domain}/${slug}`;
    lines.push(`- [${p.frontmatter.name ?? slug}](${url}): ${p.frontmatter.description ?? ""}`);
  }
  lines.push("");

  const pricing = extractPricing(home.sections["Pricing"]);
  if (pricing.length) {
    lines.push("## Pricing");
    for (const p of pricing) lines.push(`- ${p.tier}: ${p.price} — ${p.features}`);
    lines.push("");
  }

  return lines.join("\n");
}
