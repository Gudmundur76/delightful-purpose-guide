---
name: pillar-page-generator
description: Generate comprehensive SEO pillar pages with keyword research, outline, draft content, JSON-LD, and llms.txt integration. Trigger when the user asks to create a pillar page, ultimate guide, topic cluster hub, or topical authority content.
---

# Skill: Pillar Page Generator

## Description
Generates comprehensive pillar pages that establish topical authority. Automates research, outlining, drafting, and SEO optimization including JSON-LD structured data and `llms.txt` integration.

## Workflow
1. **Topic Selection**: User provides core topic/keyword.
2. **Keyword Research**: Primary, secondary, long-tail keywords.
3. **Competitor Analysis**: Top-ranking pages, content gaps, themes.
4. **Outline Generation**: Hierarchical outline with sections + sub-sections.
5. **Content Drafting**: Initial draft per section, natural keyword integration.
6. **Internal Linking Strategy**: Links to supporting cluster content.
7. **SEO Optimization**: Title tags, meta description, headings, alt text.
8. **JSON-LD Integration**: `Article`, `WebPage`, `FAQPage` schema as appropriate.
9. **llms.txt Update**: Suggest `Allow: /pillar/{slug}.md`.
10. **Review**: Present draft for human refinement and fact-check.

## Inputs
- `core_topic`: main subject/keyword
- `target_audience`: (optional)
- `tone_of_voice`: (optional, e.g. informative, authoritative)

## Outputs (write to `/mnt/documents/`)
- `pillar_page_draft.md`
- `pillar_page_json_ld.json`
- `llms_txt_update_recommendations.txt`

## JSON-LD Shape
`WebPage` with `name`, `description`, `url`, `publisher` (Organization w/ logo), `mainEntityOfPage`, `datePublished`, `dateModified`.
