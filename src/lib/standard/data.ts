// The Agent-Native Web Standard — versioned canonical specification.
// Each entry is an immutable point-in-time release. The CURRENT pointer
// moves; the versioned URLs never do. This is the RFC model: stable
// permalinks so citations compound without rot.

import standardV1Md from "../../../docs/geo-standard.md?raw";

export interface StandardVersion {
  /** Permalink slug, e.g. "v1". Never reused. */
  slug: string;
  /** Human label, e.g. "Version 1.0". */
  label: string;
  /** Internal build identifier embedded in <meta name="generator">. */
  buildId: string;
  publishedAt: string; // ISO date
  status: "current" | "superseded" | "draft";
  /** Raw markdown source — the canonical citable artifact. */
  markdown: string;
  /** One-sentence summary used in meta description + JSON-LD. */
  abstract: string;
  /** Short changelog line for the version index. */
  changelog: string;
}

export const STANDARD_VERSIONS: StandardVersion[] = [
  {
    slug: "v1",
    label: "Version 1.0",
    buildId: "geo-standard@2026.05",
    publishedAt: "2026-05-22",
    status: "current",
    markdown: standardV1Md,
    abstract:
      "The Agent-Native Web Standard v1.0 — a versioned engineering specification defining how a website becomes legible to AI search engines (ChatGPT, Perplexity, Claude, Google AI Overviews). Covers reachability pre-flight, the crawler allow/block matrix, llms.txt and JSON-LD requirements, head/meta rules, content citation triggers, and a hard performance budget. CC BY 4.0.",
    changelog:
      "Initial publication. Five-signal scoring contract, crawler matrix, llms.txt + JSON-LD requirements, performance budget, delivery checklist.",
  },
];

export function getCurrentStandard(): StandardVersion {
  const current = STANDARD_VERSIONS.find((v) => v.status === "current");
  if (!current) throw new Error("No current standard version defined");
  return current;
}

export function getStandardVersion(slug: string): StandardVersion | undefined {
  return STANDARD_VERSIONS.find((v) => v.slug === slug);
}

export const STANDARD_LICENSE = {
  name: "Creative Commons Attribution 4.0 International",
  shortName: "CC BY 4.0",
  url: "https://creativecommons.org/licenses/by/4.0/",
};

export const STANDARD_CANONICAL_URL = "https://citation.is/standard";
