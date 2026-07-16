# Agent-Native Company Template

The hosted-site template every citation.is client gets. Built for AI crawlers
first, humans second.

- **Next.js 14** (App Router, SSG)
- **Tailwind + shadcn-style primitives**
- **MDX content** in `/content/` — single source of truth
- **Auto-generated JSON-LD** (Organization, SoftwareApplication, FAQPage) at build time
- **Auto-generated `/llms.txt`** via dynamic route

## How it works

1. Edit `/content/*.mdx` (frontmatter + markdown sections).
2. `lib/content.ts` parses frontmatter + extracts `## FAQ`, `## Pricing`, etc.
3. `lib/schema.ts` emits JSON-LD blocks consumed by `app/layout.tsx`.
4. `app/api/llms.txt/route.ts` emits `/llms.txt` from the same content.
5. citation.is `auto_fix_*` tools can POST to `/api/grow/apply` to inject
   additional JSON-LD/llms.txt overrides without a redeploy
   (see `app/api/grow/apply/route.ts`).

## Quickstart

```bash
cp -r template/agent-native-company my-client-site
cd my-client-site
pnpm install
pnpm dev
```

Edit `content/index.mdx` frontmatter (`name`, `domain`, `description`) — the
schema and llms.txt update automatically.

## Registering with citation.is

```bash
curl -X POST https://citation.is/api/public/admin/platform \
  -H "Authorization: Bearer $GROW_SECRET" \
  -d '{"op":"add_site","domain":"acme.ai","plan":"pro"}'
```

The returned `install_token` goes in `.env.local` as `GROW_INSTALL_TOKEN` so
the template pulls approved interventions from
`https://citation.is/api/public/inject/{token}.json` at build time.
