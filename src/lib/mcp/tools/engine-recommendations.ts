import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";

type Effort = "1h" | "1d" | "1w" | "1m" | "ongoing";
type Impact = "+5-10" | "+10-15" | "+15-25" | "+25+";
type Component = "technical" | "authority" | "content" | "information_gain";

interface EngineFix {
  rank: number;
  action: string;
  effort: Effort;
  impact: Impact;
  ccs_component: Component;
}

interface EngineProfile {
  label: string;
  why: string;
  dominant_source: string;
  brand_owned_share: string;
  key_signal: string;
  content_strategy: string;
  fixes: EngineFix[];
}

const ENGINE_PROFILES: Record<string, EngineProfile> = {
  chatgpt: {
    label: "ChatGPT",
    why: "ChatGPT heavily favors Wikipedia (7.8% of citations) and high-authority sources. It cites 20% fewer domains after GPT-5.3 Instant. Brand-owned content gets the lowest share among all engines.",
    dominant_source: "Wikipedia (7.8%)",
    brand_owned_share: "lowest",
    key_signal: "authority",
    content_strategy:
      "Focus on third-party authority signals. Get cited by Wikipedia, major publications, and authoritative blogs. Your own content matters less than what others say about you.",
    fixes: [
      { rank: 1, action: "Get a Wikipedia page for your company", effort: "1m", impact: "+15-25", ccs_component: "authority" },
      { rank: 2, action: "Build GitHub presence (1000+ stars)", effort: "ongoing", impact: "+10-15", ccs_component: "authority" },
      { rank: 3, action: "Get listed on G2 with 50+ reviews", effort: "1w", impact: "+5-10", ccs_component: "authority" },
      { rank: 4, action: "Publish technical blog posts that answer 'What does [company] do?'", effort: "ongoing", impact: "+10-15", ccs_component: "content" },
      { rank: 5, action: "Add Organization + Product schema", effort: "1h", impact: "+5-10", ccs_component: "technical" },
    ],
  },
  perplexity: {
    label: "Perplexity",
    why: "Perplexity is the most active citer (49% of events) but most selective — visits ~10 pages, cites only 3-4. Heavily favors Reddit (46.7%) and fresh content (70% within 12-18 months).",
    dominant_source: "Reddit (46.7%)",
    brand_owned_share: "6.8%",
    key_signal: "freshness + community",
    content_strategy:
      "Stay fresh and community-active. Date-stamp everything. Maintain Reddit presence. Publish comparisons against competitors so Perplexity has structured comparison data to cite.",
    fixes: [
      { rank: 1, action: "Build Reddit presence in relevant subreddits (r/LocalLLaMA, r/MachineLearning)", effort: "ongoing", impact: "+15-25", ccs_component: "authority" },
      { rank: 2, action: "Add FAQ schema with fresh, date-stamped content", effort: "1h", impact: "+10-15", ccs_component: "technical" },
      { rank: 3, action: "Publish comparison tables (vs competitors) on your site", effort: "1d", impact: "+10-15", ccs_component: "content" },
      { rank: 4, action: "Keep changelog/release notes updated monthly", effort: "ongoing", impact: "+5-10", ccs_component: "content" },
      { rank: 5, action: "Add Q&A sections that match natural search queries", effort: "1d", impact: "+10-15", ccs_component: "content" },
    ],
  },
  claude: {
    label: "Claude",
    why: "Claude is the most selective engine (4% of events) but gives the highest brand-owned citation share (9.1%). Prefers technical documentation, PDFs, and whitepapers. Has the narrowest source pool.",
    dominant_source: "Technical documentation",
    brand_owned_share: "9.1% (highest)",
    key_signal: "technical depth",
    content_strategy:
      "Depth over breadth. Invest in long-form technical docs, API references, whitepapers, and well-structured tutorials. Claude rewards your own deep content more than any other engine.",
    fixes: [
      { rank: 1, action: "Expand technical documentation with code examples", effort: "1w", impact: "+15-25", ccs_component: "information_gain" },
      { rank: 2, action: "Publish whitepapers / research papers as PDFs", effort: "1m", impact: "+10-15", ccs_component: "information_gain" },
      { rank: 3, action: "Add HowTo schema for tutorials and guides", effort: "1h", impact: "+10-15", ccs_component: "technical" },
      { rank: 4, action: "Create comprehensive API reference docs", effort: "1w", impact: "+10-15", ccs_component: "information_gain" },
      { rank: 5, action: "Add inline code snippets and playground demos", effort: "1d", impact: "+5-10", ccs_component: "content" },
    ],
  },
  google_aio: {
    label: "Google AI Overviews",
    why: "Google AIO routes 21% of citations to own properties (YouTube) and maintains 54% overlap with traditional organic rankings. Most predictable from traditional SEO signals.",
    dominant_source: "YouTube + organic top 10",
    brand_owned_share: "52.15%",
    key_signal: "traditional SEO + video",
    content_strategy:
      "Treat AIO as SEO++. Strong backlinks, schema, and YouTube content drive it. If you rank in the top 10 organic + have video, you'll likely get cited.",
    fixes: [
      { rank: 1, action: "Create YouTube content (tutorials, demos)", effort: "1w", impact: "+15-25", ccs_component: "authority" },
      { rank: 2, action: "Ensure strong traditional SEO (backlinks, domain authority)", effort: "ongoing", impact: "+10-15", ccs_component: "authority" },
      { rank: 3, action: "Add VideoObject schema for embedded videos", effort: "1h", impact: "+5-10", ccs_component: "technical" },
      { rank: 4, action: "Optimize for featured snippets with Q&A format", effort: "1d", impact: "+10-15", ccs_component: "content" },
      { rank: 5, action: "Submit sitemap with video entries to Google", effort: "1h", impact: "+5-10", ccs_component: "technical" },
    ],
  },
};

export const getEngineRecommendationsTool = defineTool({
  name: "get_engine_specific_recommendations",
  description:
    "Return platform-specific AI citation optimization recommendations for a domain + target engine (chatgpt, perplexity, claude, google_aio). Each engine has different citation patterns — this tool returns ranked fixes with effort/impact estimates.",
  parameters: z.object({
    domain: z.string().min(3).max(255),
    engine: z.enum(["chatgpt", "perplexity", "claude", "google_aio"]),
  }),
  execute: async ({ domain, engine }) => {
    const profile = ENGINE_PROFILES[engine];
    const result = {
      domain: domain.toLowerCase().trim(),
      engine,
      engine_label: profile.label,
      current_likelihood: "medium" as const,
      why_this_engine: profile.why,
      dominant_source: profile.dominant_source,
      brand_owned_share: profile.brand_owned_share,
      key_signal: profile.key_signal,
      priority_fixes: profile.fixes,
      content_strategy: profile.content_strategy,
      estimated_impact: {
        technical: profile.fixes.filter((f) => f.ccs_component === "technical").length * 7,
        authority: profile.fixes.filter((f) => f.ccs_component === "authority").length * 12,
        content: profile.fixes.filter((f) => f.ccs_component === "content" || f.ccs_component === "information_gain").length * 10,
      },
      generated_at: new Date().toISOString(),
    };
    return JSON.stringify(result, null, 2);
  },
});
