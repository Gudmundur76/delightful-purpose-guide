// Verifiability Layer helpers (geo-standard@2026.07 §14).
// Build JSON-LD `Claim`, `StatisticalVariable`, `Observation`, and `Dataset`
// objects that connect a visible UI claim to a raw JSON citation.
//
// Usage:
//   const claim = verifiableClaim({
//     id: "stat-83",
//     value: "83%",
//     label: "Share of AI citations from outside the organic top 10",
//     citation: "https://citation.is/api/public/data/claims.json#stat-83",
//     dateModified: "2026-07-15",
//   });
//
// Then embed the returned object inside a page's JSON-LD `mentions` or
// `about` array, and wrap the visible value in `<span id="stat-83">83%</span>`.

import { sourceSameAs } from "@/lib/seo/trust-handshake";

const DATA_BASE = "https://citation.is/api/public/data";
const ARCHIVE_BASE = "https://citation.is/data";


export type VerifiableClaimInput = {
  /** DOM id used by the visible <span id="..."> wrapper. Must match the JSON fragment. */
  id: string;
  /** The rendered value (e.g. "83%", "+527%", "1,284"). */
  value: string;
  /** Human-readable label describing what the claim measures. */
  label: string;
  /** Fully-qualified citation URL pointing to the raw JSON. Defaults to /api/public/data/claims.json#{id}. */
  citation?: string;
  /** ISO date when the claim was last verified. */
  dateModified: string;
  /** Optional unit (e.g. "PERCENT", "USD"). */
  unitCode?: string;
  /** Source files in the public repo that produce/back this claim (Trust Handshake). */
  sourceFiles?: Array<{ path: string; lines?: string }>;
};

/** A schema.org Claim + nested Observation referencing a citation URL. */
export function verifiableClaim(input: VerifiableClaimInput) {
  const citation = input.citation ?? `${DATA_BASE}/claims.json#${input.id}`;
  const sameAs = sourceSameAs(input.sourceFiles);
  return {
    "@type": "Claim",
    "@id": `#${input.id}`,
    claimReviewed: input.label,
    text: `${input.label}: ${input.value}`,
    citation,
    ...(sameAs ? { sameAs } : {}),
    dateModified: input.dateModified,
    appearance: {
      "@type": "Observation",
      observationDate: input.dateModified,
      measuredProperty: input.label,
      measuredValue: input.value,
      ...(input.unitCode ? { unitCode: input.unitCode } : {}),
    },
  };
}

export type StatisticalVariableInput = {
  id: string;
  name: string;
  description: string;
  measurementMethod?: string;
  unitCode?: string;
};


export function statisticalVariable(input: StatisticalVariableInput) {
  return {
    "@type": "StatisticalVariable",
    "@id": `#${input.id}`,
    name: input.name,
    description: input.description,
    ...(input.measurementMethod ? { measurementMethod: input.measurementMethod } : {}),
    ...(input.unitCode ? { unitCode: input.unitCode } : {}),
  };
}

export type DatasetInput = {
  name: string;
  description: string;
  /** URL where the dataset is discoverable (page URL). */
  url: string;
  /** ISO date of the last verified update. */
  dateModified: string;
  /** ISO date the dataset was first published. */
  datePublished?: string;
  /** One or more downloadable distributions (live JSON + archive snapshot). */
  distribution: Array<{ contentUrl: string; encodingFormat?: string; name?: string }>;
  keywords?: string[];
  license?: string;
};

export function datasetSchema(input: DatasetInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: input.name,
    description: input.description,
    url: input.url,
    dateModified: input.dateModified,
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    creator: { "@type": "Organization", name: "Grow", url: "https://citation.is" },
    license: input.license ?? "https://creativecommons.org/licenses/by/4.0/",
    keywords: input.keywords,
    distribution: input.distribution.map((d) => ({
      "@type": "DataDownload",
      contentUrl: d.contentUrl,
      encodingFormat: d.encodingFormat ?? "application/json",
      ...(d.name ? { name: d.name } : {}),
    })),
  };
}

/** Returns `{ "aria-labelledby": id }` for a section paired with its h2/h3. */
export function sectionAria(id: string): { "aria-labelledby": string } {
  return { "aria-labelledby": id };
}

/** Build a fully-qualified citation URL for a claim id. */
export function claimCitation(id: string, archive?: string): string {
  if (archive) return `${ARCHIVE_BASE}/${archive}/claims.json#${id}`;
  return `${DATA_BASE}/claims.json#${id}`;
}

export const DATA_URLS = {
  liveClaims: `${DATA_BASE}/claims.json`,
  liveStats: `${DATA_BASE}/stats.json`,
  liveLeaderboard: `${DATA_BASE}/leaderboard.json`,
  archiveQ2_2026: `${ARCHIVE_BASE}/q2-2026`,
} as const;
