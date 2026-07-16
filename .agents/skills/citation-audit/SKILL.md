---
name: citation-audit
description: Audit external links and citations on a page or article for broken URLs, source credibility, and E-E-A-T quality. Trigger when the user asks to audit citations, check links, evaluate source trustworthiness, or improve E-E-A-T on existing content.
---

# Skill: Citation Audit

## Description
This skill performs periodic audits of content citations and external links on citation.is to ensure accuracy, authority, and adherence to E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) principles. It checks for broken links, assesses source credibility, and recommends updates to maintain content quality and SEO.

## Purpose
To maintain the integrity and trustworthiness of content by ensuring all citations are valid, external links are healthy, and the overall content reflects high E-E-A-T standards.

## Workflow
1. **Content Selection**: User specifies content (URL or article set) to audit.
2. **External Link Extraction**: Extract all external links from the content.
3. **Broken Link Check**: Verify status of each link; flag 4xx/5xx and redirects.
4. **Source Credibility Assessment**: Evaluate domain authority, publication reputation, author expertise.
5. **E-E-A-T Analysis**: Qualitative feedback on Experience, Expertise, Authoritativeness, Trustworthiness.
6. **Citation Accuracy Verification**: Cross-reference factual claims with cited sources (manual review suggested).
7. **Recommendation Generation**:
   - Replace broken links with active, relevant sources
   - Upgrade low-credibility sources
   - Enhance E-E-A-T (author bios, expert profiles)
   - Identify sections needing factual updates
8. **Reporting**: Compile findings into `citation_audit_report.md` under `/mnt/documents/`.

## Inputs
- `content_url`: URL of content to audit
- `audit_depth`: `shallow` (links only) or `deep` (credibility + E-E-A-T)

## Output
Markdown report with: Summary, Broken Links table, Low Credibility Sources table, E-E-A-T Enhancement Opportunities, Action Plan.
