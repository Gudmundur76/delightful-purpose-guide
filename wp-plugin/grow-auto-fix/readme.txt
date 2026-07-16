=== grow.contact Auto-Fix ===
Contributors: growcontact
Tags: ai, seo, schema, llms.txt, ChatGPT, Perplexity, Claude
Requires at least: 5.8
Tested up to: 6.6
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPL-2.0-or-later

Automatically improves your site's AI discoverability by injecting approved Schema.org JSON-LD, serving /llms.txt, and patching robots.txt — all pulled from your grow.contact dashboard.

== Description ==

grow.contact is a self-healing website platform that monitors how AI assistants (ChatGPT, Perplexity, Claude) describe your brand and applies fixes automatically.

This plugin connects your WordPress site to your grow.contact dashboard. Approved interventions are pulled every 6 hours and applied:

* JSON-LD blocks (FAQ, Product, Organization) injected into `<head>`
* A virtual `/llms.txt` served at your site root
* `robots.txt` patched with AI crawler directives

== Installation ==

1. Upload the plugin or install via the WordPress admin
2. Activate it
3. Go to Settings → grow.contact and paste your install token

== Changelog ==

= 1.0.0 =
* Initial release
