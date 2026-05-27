---
name: geo-site-delivery
description: Final delivery checklist for shipping a grow.contact agent-native site from Lovable preview to the client's real domain. Use when a build is complete and ready to hand over — covers pre-delivery QA, domain substitution, deploy + DNS, post-deploy verification, and client handover.
---

# GEO Site Delivery

Use this skill when a grow.contact build is finished on a Lovable subdomain and needs to ship to the client's real domain. Walk the five phases in order — do not skip ahead. Every phase has a hard pass/fail gate; if a gate fails, stop and fix before moving on.

## 1. Pre-delivery checklist

Block delivery until all three pass:

- **`/check` score = 100/100** on the Lovable subdomain (`https://<project>.lovable.app/check?url=<project>.lovable.app&auto=true`). Anything under 100 means the standard isn't met — fix per `grow-standard` / `grow-geo-recipe` skills before shipping.
- **Lovable badge disabled** in project settings (`publish_settings--set_badge_visibility` with `hide_badge: true`). Required on Pro+; never deliver with the badge visible.
- **GitHub sync enabled + repo connected.** Client gets the repo at handover — confirm it exists and is syncing before promising it.

## 2. Domain substitution

Replace every Lovable subdomain reference with the real domain **before** flipping DNS, so the first crawl on the new domain returns correct URLs.

Files to check (use `rg "lovable\.app|<project-slug>"` to find stragglers):

- `public/llms.txt` — every absolute URL
- `public/robots.txt` — `Sitemap:` directive
- `src/routes/sitemap[.]xml.ts` — `BASE_URL` constant
- `src/routes/blog/rss[.]xml.ts` (and any other RSS) — feed `<link>` + item URLs
- `src/routes/index.tsx` + every leaf route — JSON-LD `url`, `@id`, `image` fields; canonical / `og:url` in `head()`
- `src/routes/__root.tsx` — any sitewide `og:url`, JSON-LD Organization `url`
- Any hardcoded `https://...lovable.app` in components, email templates, MCP tools, server functions

Run a final `rg -i "lovable\.app"` — should return zero hits in user-facing code (backend integration files like `src/integrations/lovable/` are allowed; copy is not).

## 3. Deploy + DNS

- Set the custom domain in Lovable project settings.
- Confirm DNS propagation: `dig +short <domain>` returns Lovable's edge IPs, and `curl -I https://<domain>` returns 200 with a valid TLS cert.
- Wait for HTTPS to go fully live (cert provisioning can take a few minutes) before running phase 4.

## 4. Post-deploy verification

Run all four against the **real domain**, not the Lovable subdomain:

- `/check?url=<domain>&auto=true` → **100/100**. If Speed dropped, re-verify the edge-cache override in `src/server.ts` shipped to production (see `grow-geo-recipe` step 7).
- `curl -s https://<domain>/llms.txt` → every URL uses the real domain.
- `curl -s https://<domain>/sitemap.xml` → every `<loc>` uses the real domain.
- TTFB check: `curl -o /dev/null -s -w "TTFB: %{time_starttransfer}s\n" https://<domain>/` → **under 0.4s**. Run 3x; cold-cache first hit is fine, warm hits must be under budget.

If any check fails, fix and re-run the whole phase — don't ship a partial pass.

## 5. Client handover

Deliver in one message:

- GitHub repo link
- `/check` score screenshot (100/100 on the real domain)
- `llms.txt` URL on the real domain
- Confirmation that custom domain + HTTPS are live

## Hard rules

- Never hand over with a sub-100 score. The score IS the proof — shipping a 92 destroys the pitch.
- Never substitute domains AFTER DNS flips — the window between propagation and substitution leaks Lovable URLs into the first crawl.
- Never mention Lovable in handover copy (see `geo-specialist` brand voice rule). The repo link and Lovable project access are operational, not marketing.

## Companion skills

- `grow-standard` — the engineering contract the site must meet
- `grow-geo-recipe` — how to reach 100/100 if a check fails in phase 1 or 4
- `geo-specialist` — brand voice, positioning, and the four failure modes to re-check before handover
