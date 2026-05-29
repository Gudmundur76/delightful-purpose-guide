// Server fn for the Citation Intelligence detail page (/verify/$id).
// Joins companies + latest company_scores + last 12mo citation_history +
// recent citations + authority_signals + content_analysis + peers in same
// category. Public read via supabaseAdmin with explicit safe-column projection.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type ScoreBreakdown = {
  overall_ccs: number;
  citation_probability: number;
  authority: number;
  citability: number;
  freshness: number;
  semantic_structure: number;
  schema_richness: number;
  comparison_density: number;
  qa_density: number;
  expert_signals: number;
  scan_date: string;
};

export type HistoryPoint = {
  month: string;
  total_citations: number;
  perplexity_share: number;
  chatgpt_share: number;
  claude_share: number;
  google_aio_share: number;
  volatility: "stable" | "rising" | "falling";
};

export type CitationRow = {
  ai_engine: string;
  query_category: string;
  query_text: string;
  cited_url: string;
  position: number | null;
  confidence: number | null;
  cited_at: string;
};

export type AuthoritySignals = {
  g2_reviews: number;
  github_stars: number;
  stackoverflow_questions: number;
  news_mentions: number;
  reddit_mentions: number;
  backlinks: number;
};

export type ContentMetrics = {
  factual_density: number;
  freshness_days: number;
  expert_signals: number;
  qa_blocks: number;
  comparison_tables: number;
  video_count: number;
};

export type PeerRow = {
  domain: string;
  name: string;
  overall_ccs: number;
  citation_probability: number;
};

export type CompanyIntelligence = {
  company: {
    domain: string;
    name: string;
    category: string;
    logo_url: string | null;
    github_url: string | null;
    g2_url: string | null;
  };
  score: ScoreBreakdown | null;
  history: HistoryPoint[];
  citations: CitationRow[];
  authority: AuthoritySignals | null;
  content: ContentMetrics | null;
  peers: PeerRow[];
};

export const getCompanyIntelligence = createServerFn({ method: "GET" })
  .inputValidator((data: { domain: string }) =>
    z.object({ domain: z.string().min(1).max(253).toLowerCase() }).parse(data),
  )
  .handler(async ({ data }): Promise<{ intelligence: CompanyIntelligence | null }> => {
    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("domain,name,category,logo_url,github_url,g2_url")
      .eq("domain", data.domain)
      .maybeSingle();

    if (!company) return { intelligence: null };

    const [scoreRes, historyRes, citationsRes, authRes, contentRes, peersRes] =
      await Promise.all([
        supabaseAdmin
          .from("company_scores")
          .select(
            "overall_ccs,citation_probability,authority,citability,freshness,semantic_structure,schema_richness,comparison_density,qa_density,expert_signals,scan_date",
          )
          .eq("domain", data.domain)
          .order("scan_date", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabaseAdmin
          .from("citation_history")
          .select(
            "month,total_citations,perplexity_share,chatgpt_share,claude_share,google_aio_share,volatility",
          )
          .eq("domain", data.domain)
          .order("month", { ascending: false })
          .limit(12),
        supabaseAdmin
          .from("citations")
          .select("ai_engine,query_category,query_text,cited_url,position,confidence,cited_at")
          .eq("domain", data.domain)
          .order("cited_at", { ascending: false })
          .limit(25),
        supabaseAdmin
          .from("authority_signals")
          .select(
            "g2_reviews,github_stars,stackoverflow_questions,news_mentions,reddit_mentions,backlinks",
          )
          .eq("domain", data.domain)
          .order("scan_date", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabaseAdmin
          .from("content_analysis")
          .select(
            "factual_density,freshness_days,expert_signals,qa_blocks,comparison_tables,video_count",
          )
          .eq("domain", data.domain)
          .order("scan_date", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabaseAdmin
          .from("companies")
          .select("domain,name,category")
          .eq("category", company.category)
          .neq("domain", data.domain)
          .limit(20),
      ]);

    // Build peer rows with their latest scores
    let peers: PeerRow[] = [];
    const peerDomains = (peersRes.data ?? []).map((p) => p.domain);
    if (peerDomains.length > 0) {
      const { data: peerScores } = await supabaseAdmin
        .from("company_scores")
        .select("domain,overall_ccs,citation_probability,scan_date")
        .in("domain", peerDomains)
        .order("scan_date", { ascending: false });

      const latest = new Map<string, { overall_ccs: number; citation_probability: number }>();
      for (const s of peerScores ?? []) {
        if (!latest.has(s.domain)) {
          latest.set(s.domain, {
            overall_ccs: s.overall_ccs ?? 0,
            citation_probability: s.citation_probability ?? 0,
          });
        }
      }
      peers = (peersRes.data ?? [])
        .map((p) => ({
          domain: p.domain,
          name: p.name,
          overall_ccs: latest.get(p.domain)?.overall_ccs ?? 0,
          citation_probability: latest.get(p.domain)?.citation_probability ?? 0,
        }))
        .sort((a, b) => b.citation_probability - a.citation_probability)
        .slice(0, 6);
    }

    const history = ((historyRes.data ?? []) as HistoryPoint[])
      .slice()
      .reverse()
      .map((h) => ({
        ...h,
        perplexity_share: Number(h.perplexity_share ?? 0),
        chatgpt_share: Number(h.chatgpt_share ?? 0),
        claude_share: Number(h.claude_share ?? 0),
        google_aio_share: Number(h.google_aio_share ?? 0),
      }));

    return {
      intelligence: {
        company,
        score: scoreRes.data
          ? {
              overall_ccs: scoreRes.data.overall_ccs ?? 0,
              citation_probability: scoreRes.data.citation_probability ?? 0,
              authority: scoreRes.data.authority ?? 0,
              citability: scoreRes.data.citability ?? 0,
              freshness: scoreRes.data.freshness ?? 0,
              semantic_structure: scoreRes.data.semantic_structure ?? 0,
              schema_richness: scoreRes.data.schema_richness ?? 0,
              comparison_density: scoreRes.data.comparison_density ?? 0,
              qa_density: scoreRes.data.qa_density ?? 0,
              expert_signals: scoreRes.data.expert_signals ?? 0,
              scan_date: scoreRes.data.scan_date,
            }
          : null,
        history,
        citations: (citationsRes.data ?? []) as CitationRow[],
        authority: authRes.data as AuthoritySignals | null,
        content: contentRes.data as ContentMetrics | null,
        peers,
      },
    };
  });
