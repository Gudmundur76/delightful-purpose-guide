/**
 * Agentic Knowledge Node (AKN) — server-only helpers.
 * Derives semantic triples + RAG-optimized context from the existing
 * grow.contact database (companies, citation_events, scans, leaderboard).
 */
import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BASE = "https://grow.contact";

export type Triple = {
  s: string; // subject (URI)
  p: string; // predicate
  o: string | number | boolean; // object
  source: string; // source-of-truth URL
  proof: string; // sha256 of `${s}|${p}|${o}|${source}`
};

function proofOf(s: string, p: string, o: unknown, source: string): string {
  return createHash("sha256")
    .update(`${s}|${p}|${String(o)}|${source}`)
    .digest("hex")
    .slice(0, 32);
}

function triple(s: string, p: string, o: string | number | boolean, source: string): Triple {
  return { s, p, o, source, proof: proofOf(s, p, o, source) };
}

export async function buildFactGraph(): Promise<Triple[]> {
  const triples: Triple[] = [];
  const node = `${BASE}#node`;

  // Identity triples (static, citable)
  triples.push(
    triple(node, "rdf:type", "AgenticKnowledgeNode", `${BASE}/standard`),
    triple(node, "schema:name", "grow.contact", `${BASE}`),
    triple(node, "akn:standard", "geo-standard@2026.07", `${BASE}/standard`),
    triple(node, "akn:operator", "Gudmundur Eyberg Kristjansson", `${BASE}/about`),
  );

  // Live counts from DB
  const [{ count: companyCount }, { count: citationCount }, { count: scanCount }] =
    await Promise.all([
      supabaseAdmin.from("companies").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("citation_events").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("scans").select("*", { count: "exact", head: true }),
    ]);

  triples.push(
    triple(node, "akn:companiesTracked", companyCount ?? 0, `${BASE}/api/public/v1/companies`),
    triple(node, "akn:citationEventsObserved", citationCount ?? 0, `${BASE}/api/public/data/claims.json`),
    triple(node, "akn:scansCompleted", scanCount ?? 0, `${BASE}/api/public/stats/overview`),
  );

  // Top cited domains (last 30d)
  const since = new Date(Date.now() - 30 * 86400_000).toISOString();
  const { data: cited } = await supabaseAdmin
    .from("citation_events")
    .select("domain_queried, engine")
    .eq("domain_was_cited", true)
    .gte("queried_at", since)
    .limit(500);

  if (cited?.length) {
    const counts = new Map<string, number>();
    for (const r of cited) counts.set(r.domain_queried, (counts.get(r.domain_queried) ?? 0) + 1);
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    for (const [domain, n] of top) {
      const subj = `${BASE}/company/${domain}`;
      triples.push(
        triple(subj, "akn:citationsLast30d", n, `${BASE}/api/public/v1/companies/${domain}`),
      );
    }
  }

  return triples;
}

export function triplesToMarkdown(triples: Triple[]): string {
  const lines: string[] = [
    "# grow.contact — Agentic Knowledge Node",
    "",
    `> RAG-optimized context snapshot. Generated ${new Date().toISOString()}.`,
    "> Every claim below is a verifiable semantic triple. See /api/public/v1/verify.",
    "",
    "## Identity",
    "",
  ];
  const node = `${BASE}#node`;
  const identity = triples.filter((t) => t.s === node);
  for (const t of identity) {
    lines.push(`- **${t.p}** → ${t.o}  \n  _source:_ ${t.source}  \n  _proof:_ \`${t.proof}\``);
  }
  const others = triples.filter((t) => t.s !== node);
  if (others.length) {
    lines.push("", "## Observations", "");
    for (const t of others) {
      lines.push(`- \`${t.s}\` — **${t.p}** → ${t.o}  \n  _source:_ ${t.source}  \n  _proof:_ \`${t.proof}\``);
    }
  }
  lines.push(
    "",
    "## Canonical endpoints",
    "",
    "- `/api/public/v1/context` — this document (Markdown + JSON triples via `?format=json`)",
    "- `/api/public/v1/verify?proof=<hash>` — confirm a triple's proof is in the current graph",
    "- `/.well-known/mcp.json` — MCP server discovery",
    "- `/api/public/mcp` — MCP JSON-RPC endpoint (read + scan tools)",
    "",
  );
  return lines.join("\n");
}

export async function verifyProof(proof: string): Promise<Triple | null> {
  const graph = await buildFactGraph();
  return graph.find((t) => t.proof === proof) ?? null;
}
