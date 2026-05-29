import { createFileRoute } from "@tanstack/react-router";
import { createMcpServer, withMcpAuth } from "mcp-tanstack-start";
import { timingSafeEqual } from "node:crypto";
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
import { scheduleScanTool, listScheduledScansTool, cancelScheduledScanTool, runDueScheduledScansTool } from "@/lib/mcp/tools/scheduled-scans";
import { updatePageContentTool, updateHeroTool, getPageContentTool } from "@/lib/mcp/tools/site-content";
import { listFaqItemsTool, updateFaqItemTool } from "@/lib/mcp/tools/faq-admin";
import { listBlogDraftsTool, updateBlogPostTool, publishBlogPostTool, deleteBlogPostTool, createBlogPostTool } from "@/lib/mcp/tools/blog-admin";
import { updatePricingDisplayTool } from "@/lib/mcp/tools/pricing-admin";
import { updateClientTool, deleteLeadTool, deleteScanTool } from "@/lib/mcp/tools/crm-admin";
import { listContentEditsTool, revertContentEditTool } from "@/lib/mcp/tools/content-edits";
import { getDashboardStatsTool } from "@/lib/mcp/tools/dashboard-stats";
import { revenueStatsAliasTool } from "@/lib/mcp/tools/revenue-stats";
import { checkAuthoritySignalsTool } from "@/lib/mcp/tools/authority-signals";
import { predictCitationsTool } from "@/lib/mcp/tools/predict-citations";
import { getEngineRecommendationsTool } from "@/lib/mcp/tools/engine-recommendations";
import { getCompanyProfileTool } from "@/lib/mcp/tools/company-profile";
import { autoFixSchemaTool } from "@/lib/mcp/tools/auto-fix/schema";
import { autoFixLlmsTxtTool } from "@/lib/mcp/tools/auto-fix/llms-txt";
import { autoFixRobotsTxtTool } from "@/lib/mcp/tools/auto-fix/robots-txt";

const mcp = createMcpServer({
  name: "grow-contact-mcp",
  version: "2.0.0",
  instructions:
    "Tools for building with and operating grow.contact. NEW in 2.0: site content editing (update_page_content, update_hero, get_page_content), FAQ admin (list_faq_items, update_faq_item), blog admin (list_blog_drafts, update_blog_post, publish_blog_post, delete_blog_post), pricing display (update_pricing_display), CRM edits (update_client, delete_lead, delete_scan), revenue_stats with per-product/per-month breakdown, get_dashboard_stats with windowed defaults, check_ai_citation auto-queries when query omitted, content edit audit log (list_content_edits, revert_content_edit). 1.9: scheduled scans. Plus brand/content/blog/AI/GEO/scans/CRM/orders/email/reviews tooling.",
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
    scheduleScanTool,
    listScheduledScansTool,
    cancelScheduledScanTool,
    runDueScheduledScansTool,
    // v2.0 — site editing + admin
    updatePageContentTool,
    updateHeroTool,
    getPageContentTool,
    listFaqItemsTool,
    updateFaqItemTool,
    listBlogDraftsTool,
    createBlogPostTool,
    updateBlogPostTool,
    publishBlogPostTool,
    deleteBlogPostTool,
    updatePricingDisplayTool,
    updateClientTool,
    deleteLeadTool,
    deleteScanTool,
    listContentEditsTool,
    revertContentEditTool,
    getDashboardStatsTool,
    revenueStatsAliasTool,
    // v2.1 — citation prediction
    checkAuthoritySignalsTool,
    predictCitationsTool,
    getEngineRecommendationsTool,
    getCompanyProfileTool,
    // v2.2 — auto-fix intervention layer
    autoFixSchemaTool,
    autoFixLlmsTxtTool,
    autoFixRobotsTxtTool,
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
    // Fail closed if the secret is not configured on the server.
    if (!expected) return null;

    const token = request.headers
      .get("Authorization")
      ?.replace(/^Bearer\s+/i, "")
      .trim();
    if (!token) return null;

    // Constant-time comparison to prevent timing attacks.
    const a = Buffer.from(token, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;

    return { token: "***" };
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
