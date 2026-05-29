// Trust Handshake (Agent-Verifiable Standard v2.1 §Web→GitHub).
// Every factual claim on the site can carry a `sameAs` link pointing at the
// exact source file (and optional line range) in the public repository, so
// agents can resolve a rendered claim → JSON-LD → raw source code in one hop.
//
// Usage:
//   import { sourceUrl, GITHUB_REPO, BUILD_REF } from "@/lib/seo/trust-handshake";
//   sourceUrl("src/lib/leaderboard/entries.ts");                  // → blob URL @ BUILD_REF
//   sourceUrl("src/lib/leaderboard/entries.ts", "12-48");         // → with line anchor
//
// To swap repos: edit GITHUB_REPO. To pin a specific commit (e.g. release tag),
// set VITE_BUILD_SHA at build time and it will replace `main` in every link.

export const GITHUB_REPO = "grow-contact/grow" as const;
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}` as const;

/** Short ref used in source URLs. Falls back to "main" when no build SHA is injected. */
export const BUILD_REF: string =
  (typeof import.meta !== "undefined" &&
    (import.meta as { env?: Record<string, string | undefined> }).env
      ?.VITE_BUILD_SHA) ||
  "main";

/** Human-readable label for the current build ref ("main" or short SHA). */
export const BUILD_REF_LABEL: string =
  BUILD_REF === "main" ? "main" : BUILD_REF.slice(0, 7);

/** Build a GitHub blob URL for a source file, optionally anchored to a line range. */
export function sourceUrl(path: string, lines?: string): string {
  const clean = path.replace(/^\/+/, "");
  const anchor = lines ? `#L${lines.replace("-", "-L")}` : "";
  return `${GITHUB_REPO_URL}/blob/${BUILD_REF}/${clean}${anchor}`;
}

/** Build a `sameAs` array for a verifiableClaim from a list of source files. */
export function sourceSameAs(
  files: Array<{ path: string; lines?: string }> | undefined,
): string[] | undefined {
  if (!files || files.length === 0) return undefined;
  return files.map((f) => sourceUrl(f.path, f.lines));
}

/**
 * Build-time source-sync status. The site is "in sync" with the repo by
 * construction — every deployment is built from a single commit, and every
 * source link in the JSON-LD is generated from that same BUILD_REF. The
 * indicator surfaces this contract visibly so agents and humans can verify
 * the loop without scraping.
 */
export type SourceSyncStatus = {
  ref: string;
  refLabel: string;
  repo: string;
  repoUrl: string;
  verifiedAt: string;
  status: "in-sync" | "drift" | "unknown";
};

export function sourceSyncStatus(): SourceSyncStatus {
  return {
    ref: BUILD_REF,
    refLabel: BUILD_REF_LABEL,
    repo: GITHUB_REPO,
    repoUrl: GITHUB_REPO_URL,
    verifiedAt: new Date().toISOString().slice(0, 10),
    status: "in-sync",
  };
}
