=== citation.is MCP Server ===
Contributors: growcontact
Tags: mcp, ai, agents, chatgpt, claude, perplexity, json-rpc, geo
Requires at least: 5.8
Tested up to: 6.6
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPL-2.0-or-later

Turn your WordPress site into a Model Context Protocol (MCP) server. AI agents (ChatGPT, Claude, Perplexity, Cursor, custom agents) can query posts, pages, FAQs, WooCommerce products, and submit leads via JSON-RPC over HTTP.

== Description ==

The agent-native web is here. Instead of agents scraping your HTML and guessing, this plugin exposes structured tools they can call directly:

* `search_posts` — full-text search across posts/pages
* `get_post` — fetch a single page or post by slug/ID
* `list_pages` — discover site structure
* `list_faqs` — Q&A pairs for direct citation
* `site_info` — name, tagline, URL, theme
* `list_products` — WooCommerce catalogue (if active)
* `submit_lead` — let agents file inquiries on a user's behalf

Endpoints:
* MCP: `/wp-json/grow-mcp/v1/mcp` (POST, JSON-RPC 2.0, Streamable HTTP)
* Discovery: `/.well-known/mcp.json`

== Installation ==

1. Upload the plugin to `/wp-content/plugins/grow-mcp/` or install via WP admin
2. Activate
3. Go to **Settings → citation.is MCP**
4. Generate a bearer token (any strong random string) and paste it in
5. Optionally enable anonymous read access for public content
6. Test with the curl snippet on the settings page

== Security ==

* Write tools (`submit_lead`) ALWAYS require the bearer token
* Read tools require the token unless anonymous read is explicitly enabled
* Leads land as `mcp_lead` drafts — review before publishing/replying
* CORS is open (`*`) because MCP clients vary; auth is what protects you

== Changelog ==

= 1.0.0 =
* Initial release: 6 core tools + WooCommerce support + lead submission
