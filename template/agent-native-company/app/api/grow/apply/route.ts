// Endpoint hit by grow.contact auto-fix tools after an intervention is approved.
// Validates a shared secret, pulls the latest manifest from the install_token,
// and triggers a rebuild via the configured webhook (Vercel deploy hook, etc.).
//
// In production you would persist the manifest to a KV/edge store and read it
// from `app/layout.tsx` at request time; for the MVP we treat the upstream
// manifest as the source of truth and just kick a rebuild.

export async function POST(req: Request) {
  const secret = req.headers.get("x-grow-secret");
  if (!secret || secret !== process.env.GROW_APPLY_SECRET) {
    return new Response("unauthorized", { status: 401 });
  }

  const token = process.env.GROW_INSTALL_TOKEN;
  if (!token) return new Response("missing GROW_INSTALL_TOKEN", { status: 500 });

  // Sanity-check the manifest is reachable.
  const manifest = await fetch(`https://grow.contact/api/public/inject/${token}.json`).catch(() => null);
  if (!manifest || !manifest.ok) return new Response("manifest unreachable", { status: 502 });

  // Kick the deploy webhook (Vercel/Netlify/Cloudflare).
  const hook = process.env.DEPLOY_HOOK_URL;
  if (hook) await fetch(hook, { method: "POST" }).catch(() => null);

  return Response.json({ ok: true, rebuild_triggered: Boolean(hook) });
}
