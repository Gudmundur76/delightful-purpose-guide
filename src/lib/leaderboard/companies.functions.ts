// Server fn returning the live Citation Intelligence dataset for the
// /leaderboard page — joins companies + latest company_scores + latest
// citation_history. Public read; uses supabaseAdmin with explicit safe-column
// projection (public route loader cannot use requireSupabaseAuth).
import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type CitationIndexRow = {
  domain: string;
  name: string;
  category: string;
  logo_url: string | null;
  overall_ccs: number;
  citation_probability: number;
  total_citations: number;
  perplexity_share: number;
  chatgpt_share: number;
  claude_share: number;
  google_aio_share: number;
  volatility: "stable" | "rising" | "falling";
  citations_24h: number;
};

export const getCitationIndex = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ rows: CitationIndexRow[]; generated_at: string }> => {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [companies, scores, history, events24h] = await Promise.all([
      supabaseAdmin.from("companies").select("domain,name,category,logo_url"),
      supabaseAdmin
        .from("company_scores")
        .select("domain,overall_ccs,citation_probability,scan_date")
        .order("scan_date", { ascending: false }),
      supabaseAdmin
        .from("citation_history")
        .select(
          "domain,total_citations,perplexity_share,chatgpt_share,claude_share,google_aio_share,volatility,month",
        )
        .order("month", { ascending: false }),
      supabaseAdmin
        .from("citation_events")
        .select("domain_queried")
        .eq("domain_was_cited", true)
        .gte("queried_at", since24h),
    ]);

    if (companies.error) throw new Error(companies.error.message);

    const latestScore = new Map<string, { overall_ccs: number; citation_probability: number }>();
    for (const s of scores.data ?? []) {
      if (!latestScore.has(s.domain)) {
        latestScore.set(s.domain, {
          overall_ccs: s.overall_ccs ?? 0,
          citation_probability: s.citation_probability ?? 0,
        });
      }
    }

    const latestHistory = new Map<
      string,
      Pick<
        CitationIndexRow,
        | "total_citations"
        | "perplexity_share"
        | "chatgpt_share"
        | "claude_share"
        | "google_aio_share"
        | "volatility"
      >
    >();
    for (const h of history.data ?? []) {
      if (!latestHistory.has(h.domain)) {
        latestHistory.set(h.domain, {
          total_citations: h.total_citations ?? 0,
          perplexity_share: Number(h.perplexity_share ?? 0),
          chatgpt_share: Number(h.chatgpt_share ?? 0),
          claude_share: Number(h.claude_share ?? 0),
          google_aio_share: Number(h.google_aio_share ?? 0),
          volatility: (h.volatility as CitationIndexRow["volatility"]) ?? "stable",
        });
      }
    }

    const rows: CitationIndexRow[] = (companies.data ?? []).map((c) => {
      const s = latestScore.get(c.domain);
      const h = latestHistory.get(c.domain);
      return {
        domain: c.domain,
        name: c.name,
        category: c.category,
        logo_url: c.logo_url ?? null,
        overall_ccs: s?.overall_ccs ?? 0,
        citation_probability: s?.citation_probability ?? 0,
        total_citations: h?.total_citations ?? 0,
        perplexity_share: h?.perplexity_share ?? 0,
        chatgpt_share: h?.chatgpt_share ?? 0,
        claude_share: h?.claude_share ?? 0,
        google_aio_share: h?.google_aio_share ?? 0,
        volatility: h?.volatility ?? "stable",
      };
    });

    rows.sort((a, b) => b.citation_probability - a.citation_probability || b.overall_ccs - a.overall_ccs);

    return { rows, generated_at: new Date().toISOString() };
  },
);
