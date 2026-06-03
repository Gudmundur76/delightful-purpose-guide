// Verifiability Layer v2 — claim extraction + contradiction linting.
// Inspired by Truth Desk's claimExtractor + wikiLinter, applied to client sites.
import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const VERDICTS = [
  "supported",
  "partially_supported",
  "contradicted",
  "ambiguous",
  "insufficient_evidence",
  "out_of_scope",
  "needs_expert_review",
  "unverified",
] as const;

type Verdict = (typeof VERDICTS)[number];

function normalizeHost(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function callLovableAI(opts: {
  system: string;
  user: string;
  tool: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
  model?: string;
  webGrounding?: boolean;
}): Promise<unknown> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const body: Record<string, unknown> = {
    model: opts.model ?? "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: opts.tool.name,
          description: opts.tool.description,
          parameters: opts.tool.parameters,
        },
      },
    ],
    tool_choice: { type: "function", function: { name: opts.tool.name } },
  };

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(45000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI Gateway ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = await res.json();
  const args = json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error("No tool call in AI response");
  return typeof args === "string" ? JSON.parse(args) : args;
}

// =============================================================================
// extract_and_verify_claims — fetch a page, extract factual claims, optionally
// run a web-grounded verification pass, store everything in site_claims.
// =============================================================================
export const extractAndVerifyClaimsTool = defineTool({
  name: "extract_and_verify_claims",
  description:
    "Extract factual claims (stats, dates, counts, named entities, prices) from a single page URL, optionally verify each one against the public web, and persist results to site_claims. Returns the stored claims with verdicts. Use this to seed the Verifiability Layer for any client site.",
  parameters: z.object({
    url: z.string().url().max(2048),
    verify: z
      .boolean()
      .default(true)
      .describe(
        "When true, runs a second AI pass with web grounding to assign a verdict per claim. When false, all claims store as 'unverified'.",
      ),
    max_claims: z.number().int().min(1).max(40).default(15),
  }),
  execute: async ({ url, verify, max_claims }) => {
    const host = normalizeHost(url);

    let pageText: string;
    try {
      const res = await fetch(url, {
        redirect: "follow",
        headers: { "user-agent": "grow-contact-verifier/1.0" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        return JSON.stringify({ ok: false, error: `Fetch ${res.status}` });
      }
      pageText = stripHtml(await res.text()).slice(0, 18000);
    } catch (err) {
      return JSON.stringify({
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    // Pass 1: extract claims
    let extracted: { claims: Array<{
      entity: string;
      claim_type: string;
      claim_text: string;
      value?: string;
      unit?: string;
    }> };
    try {
      extracted = (await callLovableAI({
        system:
          "You extract verifiable factual claims from web page text. A claim must contain a specific entity (company, person, product) AND a specific value (number, date, percentage, named fact). Skip marketing fluff, opinions, and 'we are passionate' filler.",
        user: `Extract up to ${max_claims} verifiable factual claims from this page (${url}).\n\n${pageText}`,
        tool: {
          name: "store_claims",
          description: "Store extracted claims",
          parameters: {
            type: "object",
            properties: {
              claims: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    entity: { type: "string" },
                    claim_type: {
                      type: "string",
                      enum: [
                        "founded_date",
                        "performance_stat",
                        "customer_count",
                        "revenue",
                        "team_size",
                        "market_size",
                        "price",
                        "certification",
                        "location",
                        "other",
                      ],
                    },
                    claim_text: { type: "string" },
                    value: { type: "string" },
                    unit: { type: "string" },
                  },
                  required: ["entity", "claim_type", "claim_text"],
                },
              },
            },
            required: ["claims"],
          },
        },
      })) as typeof extracted;
    } catch (err) {
      return JSON.stringify({
        ok: false,
        stage: "extract",
        error: err instanceof Error ? err.message : String(err),
      });
    }

    // Pass 2: verify (optional)
    const verdicts: Record<
      number,
      { verdict: Verdict; rationale: string; evidence_urls: string[] }
    > = {};
    if (verify && extracted.claims.length > 0) {
      try {
        const verifyResult = (await callLovableAI({
          system:
            "You are a fact-checker. For each claim, search your knowledge and the public web for evidence. Assign one verdict per claim from the allowed set. Cite URLs you actually relied on.",
          user: `Verify these claims (each indexed by position):\n\n${JSON.stringify(
            extracted.claims.map((c, i) => ({ i, ...c })),
            null,
            2,
          )}`,
          tool: {
            name: "store_verdicts",
            description: "Store verdicts indexed by claim position",
            parameters: {
              type: "object",
              properties: {
                verdicts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      index: { type: "number" },
                      verdict: { type: "string", enum: VERDICTS as unknown as string[] },
                      rationale: { type: "string" },
                      evidence_urls: { type: "array", items: { type: "string" } },
                    },
                    required: ["index", "verdict", "rationale"],
                  },
                },
              },
              required: ["verdicts"],
            },
          },
        })) as {
          verdicts: Array<{
            index: number;
            verdict: Verdict;
            rationale: string;
            evidence_urls?: string[];
          }>;
        };
        for (const v of verifyResult.verdicts) {
          verdicts[v.index] = {
            verdict: v.verdict,
            rationale: v.rationale,
            evidence_urls: v.evidence_urls ?? [],
          };
        }
      } catch (err) {
        // Soft-fail: keep extracted claims but mark unverified
        console.warn("Verification pass failed:", err);
      }
    }

    // Persist
    const rows = extracted.claims.map((c, i) => {
      const v = verdicts[i];
      return {
        host,
        source_url: url,
        entity: c.entity,
        claim_type: c.claim_type,
        claim_text: c.claim_text,
        value: c.value ?? null,
        unit: c.unit ?? null,
        verdict: (v?.verdict ?? "unverified") as Verdict,
        verdict_rationale: v?.rationale ?? null,
        evidence_urls: v?.evidence_urls ?? [],
        verified_at: v ? new Date().toISOString() : null,
      };
    });

    if (rows.length === 0) {
      return JSON.stringify({ ok: true, host, count: 0, claims: [] }, null, 2);
    }

    const { data, error } = await supabaseAdmin
      .from("site_claims")
      .insert(rows)
      .select("id, entity, claim_type, claim_text, value, verdict, verdict_rationale");

    if (error) return JSON.stringify({ ok: false, stage: "store", error: error.message });

    const summary = data?.reduce<Record<string, number>>((acc, r) => {
      acc[r.verdict] = (acc[r.verdict] ?? 0) + 1;
      return acc;
    }, {}) ?? {};

    return JSON.stringify(
      {
        ok: true,
        host,
        source_url: url,
        count: data?.length ?? 0,
        summary,
        claims: data,
      },
      null,
      2,
    );
  },
});

// =============================================================================
// lint_site_contradictions — group claims by (host, entity) and ask the model
// which pairs disagree. Persists to site_claim_contradictions.
// =============================================================================
export const lintSiteContradictionsTool = defineTool({
  name: "lint_site_contradictions",
  description:
    "Scan all stored claims for a given host, grouped by entity, and detect internal contradictions (e.g. /about says founded 2019 but /blog implies 2018). Writes results to site_claim_contradictions.",
  parameters: z.object({
    host: z.string().min(1).max(253),
    min_pair_size: z.number().int().min(2).max(20).default(2),
  }),
  execute: async ({ host, min_pair_size }) => {
    const h = normalizeHost(host);
    const { data: claims, error } = await supabaseAdmin
      .from("site_claims")
      .select("id, entity, claim_type, claim_text, value, unit, source_url")
      .eq("host", h)
      .limit(500);

    if (error) return JSON.stringify({ ok: false, error: error.message });
    if (!claims || claims.length === 0) {
      return JSON.stringify({ ok: true, host: h, contradictions: 0, message: "No claims stored." });
    }

    // Group by entity
    const byEntity = new Map<string, typeof claims>();
    for (const c of claims) {
      const key = c.entity.toLowerCase().trim();
      if (!byEntity.has(key)) byEntity.set(key, []);
      byEntity.get(key)!.push(c);
    }

    const allContradictions: Array<{
      entity: string;
      claim_a_id: string;
      claim_b_id: string;
      severity: string;
      rationale: string;
    }> = [];

    for (const [entity, group] of byEntity) {
      if (group.length < min_pair_size) continue;
      try {
        const result = (await callLovableAI({
          system:
            "You detect contradictions between factual claims about the same entity. Only flag pairs where the claims are mutually exclusive or numerically inconsistent. Ignore differences in phrasing alone.",
          user: `Find contradictions among these claims about "${entity}":\n\n${JSON.stringify(
            group.map((c) => ({
              id: c.id,
              type: c.claim_type,
              text: c.claim_text,
              value: c.value,
              source: c.source_url,
            })),
            null,
            2,
          )}`,
          tool: {
            name: "store_contradictions",
            description: "Store contradiction pairs",
            parameters: {
              type: "object",
              properties: {
                contradictions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      claim_a_id: { type: "string" },
                      claim_b_id: { type: "string" },
                      severity: { type: "string", enum: ["low", "medium", "high"] },
                      rationale: { type: "string" },
                    },
                    required: ["claim_a_id", "claim_b_id", "severity", "rationale"],
                  },
                },
              },
              required: ["contradictions"],
            },
          },
        })) as {
          contradictions: Array<{
            claim_a_id: string;
            claim_b_id: string;
            severity: string;
            rationale: string;
          }>;
        };
        for (const c of result.contradictions) {
          allContradictions.push({ entity, ...c });
        }
      } catch (err) {
        console.warn(`Contradiction pass for "${entity}" failed:`, err);
      }
    }

    if (allContradictions.length === 0) {
      return JSON.stringify({ ok: true, host: h, contradictions: 0 }, null, 2);
    }

    const { data: stored, error: insErr } = await supabaseAdmin
      .from("site_claim_contradictions")
      .upsert(
        allContradictions.map((c) => ({
          host: h,
          entity: c.entity,
          claim_a_id: c.claim_a_id,
          claim_b_id: c.claim_b_id,
          severity: c.severity,
          rationale: c.rationale,
        })),
        { onConflict: "claim_a_id,claim_b_id", ignoreDuplicates: true },
      )
      .select("id, entity, severity, rationale");

    if (insErr) return JSON.stringify({ ok: false, stage: "store", error: insErr.message });

    return JSON.stringify(
      { ok: true, host: h, contradictions: stored?.length ?? 0, detail: stored },
      null,
      2,
    );
  },
});

// =============================================================================
// get_site_trust_score — aggregate verdicts into a 0-1 trust score for a host
// =============================================================================
export const getSiteTrustScoreTool = defineTool({
  name: "get_site_trust_score",
  description:
    "Compute a 0–1 trust score for a host based on stored claim verdicts. Returns supported/contradicted counts, unresolved contradictions, and the score for JSON-LD embedding.",
  parameters: z.object({ host: z.string().min(1).max(253) }),
  execute: async ({ host }) => {
    const h = normalizeHost(host);
    const { data: claims, error } = await supabaseAdmin
      .from("site_claims")
      .select("verdict")
      .eq("host", h);
    if (error) return JSON.stringify({ ok: false, error: error.message });

    const counts: Record<string, number> = {};
    for (const c of claims ?? []) counts[c.verdict] = (counts[c.verdict] ?? 0) + 1;

    const weights: Record<Verdict, number> = {
      supported: 1,
      partially_supported: 0.6,
      ambiguous: 0.4,
      needs_expert_review: 0.4,
      insufficient_evidence: 0.3,
      unverified: 0.2,
      out_of_scope: 0.5,
      contradicted: 0,
    };
    const total = claims?.length ?? 0;
    const weighted = (claims ?? []).reduce(
      (acc, c) => acc + (weights[c.verdict as Verdict] ?? 0.2),
      0,
    );
    const score = total === 0 ? null : Number((weighted / total).toFixed(2));

    const { count: unresolved } = await supabaseAdmin
      .from("site_claim_contradictions")
      .select("id", { count: "exact", head: true })
      .eq("host", h)
      .is("resolved_at", null);

    return JSON.stringify(
      {
        ok: true,
        host: h,
        total_claims: total,
        counts,
        unresolved_contradictions: unresolved ?? 0,
        trust_score: score,
      },
      null,
      2,
    );
  },
});
