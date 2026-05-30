// Server-only MDX loader. Parses frontmatter + extracts named sections.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface Frontmatter {
  name: string;
  domain: string;
  description: string;
  category?: string;
  founded?: string;
  funding?: string;
  team_size?: number;
  website?: string;
  github?: string;
  logo?: string;
  contact_email?: string;
}

export interface ParsedPage {
  frontmatter: Frontmatter;
  body: string;
  sections: Record<string, string>; // "FAQ" -> markdown body of that ## section
}

const CONTENT_DIR = path.join(process.cwd(), "content");

export function loadPage(slug: string): ParsedPage {
  const file = fs.readFileSync(path.join(CONTENT_DIR, `${slug}.mdx`), "utf8");
  const { data, content } = matter(file);
  return {
    frontmatter: data as Frontmatter,
    body: content,
    sections: splitSections(content),
  };
}

export function listPages(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, ""));
}

function splitSections(md: string): Record<string, string> {
  const out: Record<string, string> = {};
  const lines = md.split("\n");
  let current: string | null = null;
  let buf: string[] = [];
  for (const line of lines) {
    const h2 = /^##\s+(.+?)\s*$/.exec(line);
    if (h2) {
      if (current) out[current] = buf.join("\n").trim();
      current = h2[1];
      buf = [];
    } else if (current) {
      buf.push(line);
    }
  }
  if (current) out[current] = buf.join("\n").trim();
  return out;
}

export interface QaPair { question: string; answer: string; }

export function extractFaq(section: string | undefined): QaPair[] {
  if (!section) return [];
  const pairs: QaPair[] = [];
  const blocks = section.split(/^###\s+/m).slice(1);
  for (const b of blocks) {
    const nl = b.indexOf("\n");
    if (nl < 0) continue;
    pairs.push({
      question: b.slice(0, nl).trim(),
      answer: b.slice(nl + 1).trim().replace(/\n+/g, " "),
    });
  }
  return pairs;
}

export interface PricingRow { tier: string; price: string; features: string; }

export function extractPricing(section: string | undefined): PricingRow[] {
  if (!section) return [];
  const rows: PricingRow[] = [];
  for (const line of section.split("\n")) {
    const m = /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/.exec(line);
    if (!m) continue;
    const [, tier, price, features] = m;
    if (/^-+$/.test(tier.trim())) continue;
    if (/tier/i.test(tier) && /price/i.test(price)) continue;
    rows.push({ tier: tier.trim(), price: price.trim(), features: features.trim() });
  }
  return rows;
}
