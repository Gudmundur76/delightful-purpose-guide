// Public dataset endpoint — Citation Intelligence Index with the new
// Citation Corpus Score (CCS) model: 6 pillars + overall CCS + cite probability
// + 30d platform shares + 24h cite count + volatility. Live from Supabase.
// Stable, CORS-open, citable by journalists, tooling, and The Verifier satellite.
import { createFileRoute } from "@tanstack/react-router";
import { getCitationIndex } from "@/lib/leaderboard/companies.functions";

export const Route = createFileRoute("/api/public/leaderboard.json")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const catParam = url.searchParams.get("category");
        const volParam = url.searchParams.get("volatility");
        const limit = Math.min(
          1000,
          Math.max(1, parseInt(url.searchParams.get("limit") ?? "1000", 10) || 1000),
        );

        const { rows, generated_at } = await getCitationIndex();

        let filtered = rows;
        if (catParam) filtered = filtered.filter((r) => r.category === catParam);
        if (volParam && ["rising", "falling", "stable"].includes(volParam)) {
          filtered = filtered.filter((r) => r.volatility === volParam);
        }
        const entries = filtered.slice(0, limit).map((r, i) => ({
          rank: i + 1,
          name: r.name,
          domain: r.domain,
          category: r.category,
          ccs: r.overall_ccs,
          pillars: {
            authority: r.authority,
            verifiability: r.verifiability,
            precedent: r.precedent,
            commentary: r.commentary,
            information_gain: r.information_gain,
            canonical: r.canonical,
          },
          citation_probability: r.citation_probability,
          shares_30d: {
            perplexity: r.perplexity_share,
            chatgpt: r.chatgpt_share,
            claude: r.claude_share,
            google_aio: r.google_aio_share,
          },
          total_citations_30d: r.total_citations,
          citations_24h: r.citations_24h,
          volatility: r.volatility,
          verify_url: `https://citation.is/verify/${r.domain}`,
          badge_url: `https://citation.is/badge/${r.domain}.svg`,
        }));

        const body = {
          generated_at,
          standard: "ccs@2026.05",
          model: "Citation Corpus Score",
          attribution: "citation.is Citation Intelligence Index (CC BY 4.0)",
          methodology_url: "https://citation.is/leaderboard/methodology",
          methodology: {
            scale: "0-100",
            pillars: {
              authority: "GitHub stars, G2 reviews, news mentions, Stack Overflow.",
              verifiability: "Source attribution, methodology disclosure, reproducibility.",
              precedent: "Historical citation frequency across Perplexity, ChatGPT, Claude.",
              commentary: "How often research and third parties reference this company.",
              information_gain: "Proprietary data, original research, unique stats.",
              canonical: "Technical parseability — semantic HTML, JSON-LD, llms.txt, speed.",
            },
            notes:
              "CCS is a weighted blend of the six pillars. Scores recompute as new citations are ingested. Re-score any domain live at /check?u=<domain>.",
          },
          counts: {
            total: rows.length,
            returned: entries.length,
          },
          entries,
        };

        return new Response(JSON.stringify(body, null, 2), {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=300, s-maxage=900",
          },
        });
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }),
    },
  },
});
