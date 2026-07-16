#!/usr/bin/env bash
# Apply the Grow GEO Recipe to the current project.
# Detects stack and copies the right templates.
# Run from the project root. Idempotent: skips files that already exist
# unless --force is passed.
#
# Usage:
#   bash apply.sh [--force]

set -euo pipefail

FORCE=0
[[ "${1:-}" == "--force" ]] && FORCE=1

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

copy() {
  local src="$1" dst="$2"
  if [[ -f "$dst" && $FORCE -eq 0 ]]; then
    echo "  skip   $dst (exists, --force to overwrite)"
    return
  fi
  mkdir -p "$(dirname "$dst")"
  cp "$src" "$dst"
  echo "  wrote  $dst"
}

echo "Grow GEO Recipe — applier"
echo

# Stack detection
if [[ -f "src/routes/__root.tsx" ]]; then
  STACK="tanstack"
elif [[ -f "index.html" && -f "src/main.tsx" ]]; then
  STACK="vite"
else
  STACK="unknown"
fi
echo "Detected stack: $STACK"
echo

# Always-on assets
copy "$SKILL_DIR/assets/robots.txt"       "public/robots.txt"
copy "$SKILL_DIR/assets/llms.txt.example" "public/llms.txt"

case "$STACK" in
  tanstack)
    copy "$SKILL_DIR/assets/tanstack/sitemap[.]xml.ts" "src/routes/sitemap[.]xml.ts"
    echo
    echo "Templates to apply BY HAND (open and follow comments):"
    echo "  - $SKILL_DIR/assets/tanstack/route-head.template.tsx"
    echo "  - $SKILL_DIR/assets/tanstack/root-head.snippet.tsx     → merge into src/routes/__root.tsx"
    echo "  - $SKILL_DIR/assets/tanstack/server.cache-snippet.ts   → patch src/server.ts (THE SPEED FIX)"
    ;;
  vite)
    copy "$SKILL_DIR/assets/vite/sitemap.xml" "public/sitemap.xml"
    echo
    echo "Templates to apply BY HAND:"
    echo "  - $SKILL_DIR/assets/vite/index-head.html   → paste into <head> of index.html"
    echo
    echo "WARNING: CSR-only projects can't fully satisfy the Grow GEO Standard."
    echo "Crawlers that disable JS see an empty page. Migrate to TanStack Start for 100/100."
    ;;
  *)
    echo "Unknown stack. Read references/geo-standard.md and adapt by hand."
    ;;
esac

echo
echo "Next steps:"
echo "  1. Edit public/robots.txt and public/llms.txt → replace citation.is with the project domain"
echo "  2. Replace placeholder URLs in copied templates"
echo "  3. Add per-route head() to every leaf route (TanStack) or static <meta> per page"
echo "  4. Audit semantic HTML: 1x <h1>, landmarks present, alt text on all <img>"
echo "  5. Run the /check scanner — target 90+/100, ideally 100/100"
echo "  6. If Speed < 100 on TanStack: confirm the src/server.ts cache patch reached production"
