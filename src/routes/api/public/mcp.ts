import { createFileRoute } from "@tanstack/react-router";
import { createMcpServer, withMcpAuth } from "mcp-tanstack-start";
import { pingTool } from "@/lib/mcp/tools/ping";
import { siteInfoTool } from "@/lib/mcp/tools/site-info";
import { brandKitTool } from "@/lib/mcp/tools/brand-kit";
import { copyTool } from "@/lib/mcp/tools/copy";
import { submitForReviewTool } from "@/lib/mcp/tools/submit-for-review";
import { scanUrlTool } from "@/lib/mcp/tools/scan-url";
import { recentScansTool } from "@/lib/mcp/tools/recent-scans";
import { listProductsTool } from "@/lib/mcp/tools/list-products";
import { listPendingReviewsTool, updateReviewStatusTool } from "@/lib/mcp/tools/reviews";
import { submitLeadTool } from "@/lib/mcp/tools/submit-lead";
import { statsTool } from "@/lib/mcp/tools/stats";
import { geoStandardTool } from "@/lib/mcp/tools/geo-standard";
import { listBlogPostsTool, getBlogPostTool } from "@/lib/mcp/tools/blog";
import { listLeadsTool, getLeadTool } from "@/lib/mcp/tools/leads-admin";
import { getScanTool, compareHostsTool } from "@/lib/mcp/tools/scan-detail";
import { listOrdersTool, revenueStatsTool } from "@/lib/mcp/tools/orders";
import { healthCheckTool } from "@/lib/mcp/tools/health";
import { listClientsTool, createClientTool } from "@/lib/mcp/tools/clients";
import { listProjectsTool, updateProjectStatusTool } from "@/lib/mcp/tools/projects";
import { leaderboardTool } from "@/lib/mcp/tools/leaderboard";
import { generateOutreachTool } from "@/lib/mcp/tools/outreach";
import { searchScansTool, listReportRequestsTool, suppressEmailTool, activityFeedTool } from "@/lib/mcp/tools/ops";
import { systemStatusTool } from "@/lib/mcp/tools/system-status";
import { exportScansCsvTool, hostTrendTool } from "@/lib/mcp/tools/scan-export";
import { upsertProductTool, setProductActiveTool } from "@/lib/mcp/tools/products-admin";
import { listEmailLogTool, emailDeliveryStatsTool, isEmailSuppressedTool } from "@/lib/mcp/tools/email-ops";
import { saveLeadReplyTool, requalifyLeadTool } from "@/lib/mcp/tools/lead-reply";
import { listAdminsTool, grantRoleTool, revokeRoleTool } from "@/lib/mcp/tools/admin-roles";
import { searchBlogContentTool } from "@/lib/mcp/tools/blog-search";
import { aiCompleteTool, draftBlogPostTool } from "@/lib/mcp/tools/ai-content";
import { topScannedHostsTool, leadFunnelTool } from "@/lib/mcp/tools/insights";
import { fetchUrlTool, checkLlmsTxtTool } from "@/lib/mcp/tools/web-probe";
import { getCompetitorScoreTool } from "@/lib/mcp/tools/competitor";
import { bulkScanTool } from "@/lib/mcp/tools/bulk-scan";
import { generateImageTool } from "@/lib/mcp/tools/generate-image";
import { validateJsonLdTool, extractMetaTagsTool } from "@/lib/mcp/tools/page-audit";
import { tableRowCountsTool, recentActivityForHostTool } from "@/lib/mcp/tools/db-insights";
import { generateLlmsTxtTool } from "@/lib/mcp/tools/llms-txt";
import { siteUrlsTool } from "@/lib/mcp/tools/site-urls";
import { checkAiCitationTool, getCitationSourcesTool } from "@/lib/mcp/tools/ai-citation";
import { trackCompetitorOverTimeTool, diffScanTool } from "@/lib/mcp/tools/scan-trend";
import { sendReportEmailTool, triggerClientAlertTool } from "@/lib/mcp/tools/client-comms";
import { updateLeadTierTool, createInvoiceTool } from "@/lib/mcp/tools/funnel";
import { publishLlmsTxtTool, pushSchemaTool } from "@/lib/mcp/tools/publish-helpers";
import { generateBadgeEmbedTool, submitToLeaderboardTool, wordpressPluginConfigTool } from "@/lib/mcp/tools/distribution";
import { aiCompleteWithContextTool } from "@/lib/mcp/tools/agent";

const mcp = createMcpServer({
  name: "grow-contact-mcp",
  version: "1.8.0",
  instructions:
    "Tools for building with and operating grow.contact. NEW in 1.8: check_ai_citation (true GEO metric — does an LLM cite the host?), get_citation_sources, track_competitor_over_time, diff_scan, send_report_email, trigger_client_alert, update_lead_tier, create_invoice, publish_llms_txt (validate+stage), push_schema (JSON-LD snippet), generate_badge_embed, submit_to_leaderboard, create_wordpress_plugin_config, ai_complete_with_context (reason over our own data). Plus everything from 1.7: brand/content/blog, AI generation (ai_complete, draft_blog_post, generate_image), GEO scans, bulk_scan, page audit, sales/funnel, CRM, catalog, revenue, email ops, roles, ops, human-in-the-loop reviews.",
  tools: [
    pingTool,
    healthCheckTool,
    systemStatusTool,
    siteInfoTool,
    brandKitTool,
    copyTool,
    geoStandardTool,
    scanUrlTool,
    bulkScanTool,
    getScanTool,
    recentScansTool,
    compareHostsTool,
    hostTrendTool,
    exportScansCsvTool,
    listProductsTool,
    upsertProductTool,
    setProductActiveTool,
    listBlogPostsTool,
    getBlogPostTool,
    submitLeadTool,
    listLeadsTool,
    getLeadTool,
    saveLeadReplyTool,
    requalifyLeadTool,
    listOrdersTool,
    revenueStatsTool,
    submitForReviewTool,
    listPendingReviewsTool,
    updateReviewStatusTool,
    statsTool,
    listClientsTool,
    createClientTool,
    listProjectsTool,
    updateProjectStatusTool,
    leaderboardTool,
    generateOutreachTool,
    searchScansTool,
    listReportRequestsTool,
    suppressEmailTool,
    activityFeedTool,
    listEmailLogTool,
    emailDeliveryStatsTool,
    isEmailSuppressedTool,
    listAdminsTool,
    grantRoleTool,
    revokeRoleTool,
    searchBlogContentTool,
    aiCompleteTool,
    draftBlogPostTool,
    topScannedHostsTool,
    leadFunnelTool,
    fetchUrlTool,
    checkLlmsTxtTool,
    getCompetitorScoreTool,
    generateImageTool,
    validateJsonLdTool,
    extractMetaTagsTool,
    tableRowCountsTool,
    recentActivityForHostTool,
    generateLlmsTxtTool,
    siteUrlsTool,
    checkAiCitationTool,
    getCitationSourcesTool,
    trackCompetitorOverTimeTool,
    diffScanTool,
    sendReportEmailTool,
    triggerClientAlertTool,
    updateLeadTierTool,
    createInvoiceTool,
    publishLlmsTxtTool,
    pushSchemaTool,
    generateBadgeEmbedTool,
    submitToLeaderboardTool,
    wordpressPluginConfigTool,
    aiCompleteWithContextTool,
  ],
});


const methodNotAllowed = () =>
  new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    }),
    {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        Allow: "POST, OPTIONS",
      },
    },
  );

const authenticatedHandler = withMcpAuth(
  async (request, auth) => {
    return mcp.handleRequest(request, { auth });
  },
  async (request) => {
    const expected = process.env.MCP_SECRET;
    if (!expected) return null;
    const token = request.headers
      .get("Authorization")
      ?.replace(/^Bearer\s+/i, "");
    if (!token || token !== expected) return null;
    return { token };
  },
);

export const Route = createFileRoute("/api/public/mcp")({
  server: {
    handlers: {
      POST: async ({ request }) => authenticatedHandler(request),
      GET: async () => methodNotAllowed(),
      DELETE: async () => methodNotAllowed(),
    },
  },
});
