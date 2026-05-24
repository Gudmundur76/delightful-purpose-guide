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

const mcp = createMcpServer({
  name: "grow-contact-mcp",
  version: "1.4.0",
  instructions:
    "Tools for building with and operating grow.contact. Brand/content: get_brand_kit, get_copy, get_geo_standard, list_blog_posts, get_blog_post. GEO: scan_url, search_scans, get_scan, list_recent_scans, compare_hosts, get_leaderboard. Sales: submit_lead, list_leads, get_lead, generate_outreach_email, list_report_requests, suppress_email. CRM/delivery: list_clients, create_client, list_projects, update_project_status. Revenue: list_orders, get_revenue_stats. Ops: get_activity_feed, get_stats, health_check. Human-in-the-loop: submit_for_review, list_pending_reviews, update_review_status.",
  tools: [
    pingTool,
    healthCheckTool,
    siteInfoTool,
    brandKitTool,
    copyTool,
    geoStandardTool,
    scanUrlTool,
    getScanTool,
    recentScansTool,
    compareHostsTool,
    listProductsTool,
    listBlogPostsTool,
    getBlogPostTool,
    submitLeadTool,
    listLeadsTool,
    getLeadTool,
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
