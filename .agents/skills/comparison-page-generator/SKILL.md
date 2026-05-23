---
name: comparison-page-generator
description: Generate "X vs Y" comparison pages with feature tables, pros/cons, and Schema.org Product/ItemList JSON-LD. Trigger when the user asks to create a comparison page, "vs" page, alternatives page, or compare products/services/tools.
---

# Skill: Comparison Page Generator

## Description
Generates detailed comparison pages with structured feature tables, pros and cons, and Schema.org `Product`/`Service` + `ItemList` JSON-LD markup for enhanced search and AI readability.

## Workflow
1. **Entities for Comparison**: User provides 2+ entities to compare.
2. **Feature Identification**: Identify key features, specs, attributes.
3. **Data Collection**: Gather features, pricing, pros, cons, use cases.
4. **Structured Table**: Side-by-side comparison table.
5. **Pros and Cons**: Balanced lists per entity.
6. **Summary + Recommendation**: When-to-pick guidance.
7. **JSON-LD Generation**: `Product`/`Service` schema per entity + `ItemList` for the comparison.
8. **SEO Optimization**: Comparative keywords, intent matching.
9. **llms.txt Update**: Suggest `Allow: /comparisons/{slug1}-vs-{slug2}.md`.
10. **Review**: Present draft for human review.

## Inputs
- `entities`: list of entities to compare
- `comparison_criteria`: (optional) focus criteria

## Outputs (write to `/mnt/documents/`)
- `comparison_page_draft.md`
- `comparison_page_json_ld.json`
- `llms_txt_update_recommendations.txt`

## JSON-LD Shape
`ItemList` containing `ListItem` → `Product` entries with `name`, `description`, `url`, and `aggregateRating` (`ratingValue`, `reviewCount`).

## llms.txt Integration
Add a line per comparison page pointing to its `.md` version so AI models can index structured comparison data.
