// Curated, public-safe catalog of MCP tools surfaced on /playground.
// Source of truth: src/routes/api/public/mcp.ts (90+ tools).
// This file lists names + descriptions for display; execution goes through
// the existing /api/public/mcp endpoint (auth required) or the public
// /api/public/v1/analyze endpoint (rate-limited, no auth).

export type ToolCategory =
  | "Scan & Audit"
  | "Content & Blog"
  | "Leads & CRM"
  | "Dashboard & Stats"
  | "Site Content"
  | "Distribution"
  | "AI & Generation"
  | "Admin & Ops";

export interface ToolMeta {
  name: string;
  description: string;
  category: ToolCategory;
  /** Safe to expose to anonymous visitors via the public runner. */
  publicSafe?: boolean;
  /** True if call mutates state; requires OAuth in playground. */
  mutates?: boolean;
}

export const TOOLS: ToolMeta[] = [
  // Scan & Audit
  { name: "scan_url", description: "Run the full GEO scan on any URL.", category: "Scan & Audit", publicSafe: true },
  { name: "bulk_scan_urls", description: "Scan up to 20 URLs at once.", category: "Scan & Audit" },
  { name: "get_scan", description: "Fetch a stored scan by id.", category: "Scan & Audit", publicSafe: true },
  { name: "compare_hosts", description: "Side-by-side score comparison for two hosts.", category: "Scan & Audit", publicSafe: true },
  { name: "diff_scan", description: "Diff two scans of the same host over time.", category: "Scan & Audit" },
  { name: "track_competitor_over_time", description: "Plot a competitor's score history.", category: "Scan & Audit" },
  { name: "get_competitor_score", description: "One-shot competitor score lookup.", category: "Scan & Audit", publicSafe: true },
  { name: "validate_jsonld", description: "Validate JSON-LD blocks on a page.", category: "Scan & Audit", publicSafe: true },
  { name: "extract_meta_tags", description: "Pull title, description, OG, canonical, robots.", category: "Scan & Audit", publicSafe: true },
  { name: "fetch_url", description: "Server-side fetch with bot UA, returns HTML.", category: "Scan & Audit", publicSafe: true },
  { name: "check_llms_txt", description: "Verify llms.txt presence and validity.", category: "Scan & Audit", publicSafe: true },
  { name: "generate_llms_txt", description: "Draft an llms.txt from sitemap.", category: "Scan & Audit" },
  { name: "publish_llms_txt", description: "Publish llms.txt to a managed site.", category: "Scan & Audit", mutates: true },
  { name: "get_geo_standard", description: "Fetch the current GEO Standard spec.", category: "Scan & Audit", publicSafe: true },
  { name: "list_recent_scans", description: "Last N scans across all hosts.", category: "Scan & Audit" },
  { name: "search_scans", description: "Search scans by host/url/score range.", category: "Scan & Audit" },
  { name: "export_scans_csv", description: "Export scan history as CSV.", category: "Scan & Audit" },
  { name: "get_host_trend", description: "Score timeseries for a single host.", category: "Scan & Audit" },

  // Content & Blog
  { name: "list_blog_posts", description: "Paginated list of published posts.", category: "Content & Blog", publicSafe: true },
  { name: "get_blog_post", description: "Fetch a post by slug.", category: "Content & Blog", publicSafe: true },
  { name: "search_blog_content", description: "Full-text search across posts.", category: "Content & Blog", publicSafe: true },
  { name: "create_blog_post", description: "Create a new draft.", category: "Content & Blog", mutates: true },
  { name: "list_blog_drafts", description: "Pending drafts in the queue.", category: "Content & Blog" },
  { name: "update_blog_post", description: "Edit body, tags, metadata.", category: "Content & Blog", mutates: true },
  { name: "publish_blog_post", description: "Flip draft → published.", category: "Content & Blog", mutates: true },
  { name: "delete_blog_post", description: "Soft-delete a post.", category: "Content & Blog", mutates: true },

  // Leads & CRM
  { name: "submit_lead", description: "Submit a contact-form lead.", category: "Leads & CRM" },
  { name: "list_leads", description: "Recent leads with qualification.", category: "Leads & CRM" },
  { name: "get_lead", description: "One lead with full history.", category: "Leads & CRM" },
  { name: "list_clients", description: "Active client roster.", category: "Leads & CRM" },
  { name: "create_client", description: "Onboard a new client.", category: "Leads & CRM", mutates: true },
  { name: "update_client", description: "Edit client metadata.", category: "Leads & CRM", mutates: true },
  { name: "save_lead_reply", description: "Log an outbound reply.", category: "Leads & CRM", mutates: true },
  { name: "requalify_lead", description: "Re-run AI qualification.", category: "Leads & CRM", mutates: true },
  { name: "update_lead_tier", description: "Move lead between tiers.", category: "Leads & CRM", mutates: true },
  { name: "create_invoice", description: "Issue an invoice for a lead.", category: "Leads & CRM", mutates: true },

  // Dashboard & Stats
  { name: "get_stats", description: "High-level KPIs.", category: "Dashboard & Stats", publicSafe: true },
  { name: "get_dashboard_stats", description: "Windowed dashboard stats.", category: "Dashboard & Stats" },
  { name: "top_scanned_hosts", description: "Most-scanned hosts this week.", category: "Dashboard & Stats", publicSafe: true },
  { name: "get_lead_funnel", description: "Funnel breakdown by stage.", category: "Dashboard & Stats" },
  { name: "revenue_stats", description: "MRR / revenue rollup.", category: "Dashboard & Stats" },
  { name: "get_activity_feed", description: "Recent activity stream.", category: "Dashboard & Stats" },
  { name: "table_row_counts", description: "Row counts per table.", category: "Dashboard & Stats" },
  { name: "recent_activity_for_host", description: "Activity feed scoped to a host.", category: "Dashboard & Stats" },
  { name: "list_orders", description: "Recent orders.", category: "Dashboard & Stats" },
  { name: "get_revenue_stats", description: "Detailed revenue breakdown.", category: "Dashboard & Stats" },

  // Site Content
  { name: "get_page_content", description: "Read editable copy for a page.", category: "Site Content" },
  { name: "update_page_content", description: "Write copy for a page.", category: "Site Content", mutates: true },
  { name: "update_hero", description: "Edit homepage hero.", category: "Site Content", mutates: true },
  { name: "get_copy", description: "Bulk fetch site copy.", category: "Site Content" },
  { name: "get_site_urls", description: "List all canonical URLs.", category: "Site Content", publicSafe: true },
  { name: "site_info", description: "Site metadata + brand kit.", category: "Site Content", publicSafe: true },
  { name: "get_brand_kit", description: "Colors, fonts, tokens.", category: "Site Content", publicSafe: true },
  { name: "list_content_edits", description: "Audit log of content edits.", category: "Site Content" },
  { name: "revert_content_edit", description: "Roll back a single edit.", category: "Site Content", mutates: true },

  // Distribution
  { name: "generate_badge_embed", description: "Get embed code for the GEO badge.", category: "Distribution", publicSafe: true },
  { name: "submit_to_leaderboard", description: "Add a site to the leaderboard.", category: "Distribution" },
  { name: "create_wordpress_plugin_config", description: "Generate WP plugin config.", category: "Distribution" },
  { name: "push_schema", description: "Push JSON-LD to a managed site.", category: "Distribution", mutates: true },

  // AI & Generation
  { name: "ai_complete", description: "One-shot LLM completion.", category: "AI & Generation" },
  { name: "ai_complete_with_context", description: "Completion with tool-fetched context.", category: "AI & Generation" },
  { name: "draft_blog_post", description: "Generate a full blog post draft.", category: "AI & Generation", mutates: true },
  { name: "generate_image", description: "Text-to-image via Lovable AI.", category: "AI & Generation" },
  { name: "generate_outreach_email", description: "Draft an outreach email.", category: "AI & Generation" },

  // Admin & Ops
  { name: "health_check", description: "Liveness probe.", category: "Admin & Ops", publicSafe: true },
  { name: "ping", description: "Echo for transport sanity.", category: "Admin & Ops", publicSafe: true },
  { name: "get_system_status", description: "Subsystem status rollup.", category: "Admin & Ops", publicSafe: true },
  { name: "list_admins", description: "Admin roster.", category: "Admin & Ops" },
  { name: "grant_role", description: "Grant a role.", category: "Admin & Ops", mutates: true },
  { name: "revoke_role", description: "Revoke a role.", category: "Admin & Ops", mutates: true },
  { name: "list_email_log", description: "Recent transactional emails.", category: "Admin & Ops" },
  { name: "get_email_delivery_stats", description: "Delivery / bounce stats.", category: "Admin & Ops" },
  { name: "is_email_suppressed", description: "Check suppression status.", category: "Admin & Ops" },
  { name: "suppress_email", description: "Add an address to suppression.", category: "Admin & Ops", mutates: true },
  { name: "list_faq_items", description: "FAQ entries.", category: "Admin & Ops" },
  { name: "update_faq_item", description: "Edit a FAQ entry.", category: "Admin & Ops", mutates: true },
  { name: "update_pricing_display", description: "Edit displayed pricing.", category: "Admin & Ops", mutates: true },
  { name: "upsert_product", description: "Create or edit a product.", category: "Admin & Ops", mutates: true },
  { name: "set_product_active", description: "Toggle product visibility.", category: "Admin & Ops", mutates: true },
  { name: "list_products", description: "All products.", category: "Admin & Ops", publicSafe: true },
  { name: "list_projects", description: "Engagements in flight.", category: "Admin & Ops" },
  { name: "update_project_status", description: "Move a project stage.", category: "Admin & Ops", mutates: true },
  { name: "schedule_scan", description: "Schedule a recurring scan.", category: "Admin & Ops", mutates: true },
  { name: "list_scheduled_scans", description: "Scheduled scan roster.", category: "Admin & Ops" },
  { name: "cancel_scheduled_scan", description: "Cancel a scheduled scan.", category: "Admin & Ops", mutates: true },
  { name: "run_due_scheduled_scans", description: "Run all due scans now.", category: "Admin & Ops", mutates: true },
  { name: "list_report_requests", description: "Email-report opt-ins.", category: "Admin & Ops" },
  { name: "send_report_email", description: "Send a scan report.", category: "Admin & Ops", mutates: true },
  { name: "trigger_client_alert", description: "Notify a client of a score change.", category: "Admin & Ops", mutates: true },
  { name: "submit_for_review", description: "Send a build for human review.", category: "Admin & Ops", mutates: true },
];

export const CATEGORIES: ToolCategory[] = [
  "Scan & Audit",
  "Content & Blog",
  "Leads & CRM",
  "Dashboard & Stats",
  "Site Content",
  "Distribution",
  "AI & Generation",
  "Admin & Ops",
];

export function toolsByCategory(): Record<ToolCategory, ToolMeta[]> {
  const out = Object.fromEntries(CATEGORIES.map((c) => [c, [] as ToolMeta[]])) as Record<
    ToolCategory,
    ToolMeta[]
  >;
  for (const t of TOOLS) out[t.category].push(t);
  return out;
}
