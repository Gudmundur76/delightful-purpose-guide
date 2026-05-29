// Signed webhook for batch citation imports.
// Auth: HMAC-SHA256 over the raw request body using CITATION_WEBHOOK_SECRET,
// sent in `X-Signature` as hex. Falls back to CRON_SECRET via `x-cron-secret`
// for internal/manual replays.
import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { ingestCitationBatch } from "@/lib/citations/ingest.server";

function verifyHmac(secret: string, body: string, signature: string): boolean {
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  try {
    const a = Buffer.from(signature, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/public/hooks/citation-import")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text();

        const hmacSecret = process.env.CITATION_WEBHOOK_SECRET;
        const cronSecret = process.env.CRON_SECRET;
        const sig = request.headers.get("x-signature") ?? "";
        const cronHdr = request.headers.get("x-cron-secret") ?? "";

        const hmacOk = hmacSecret && sig && verifyHmac(hmacSecret, body, sig);
        const cronOk = cronSecret && cronHdr && cronHdr === cronSecret;
        if (!hmacOk && !cronOk) {
          return new Response("Unauthorized", { status: 401 });
        }

        let payload: unknown;
        try {
          payload = JSON.parse(body);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const rows =
          payload && typeof payload === "object" && "citations" in payload
            ? (payload as { citations: unknown }).citations
            : null;
        if (!Array.isArray(rows)) {
          return new Response("Missing citations[]", { status: 400 });
        }

        const result = await ingestCitationBatch(rows);
        return Response.json({ ok: true, ...result });
      },
    },
  },
});
