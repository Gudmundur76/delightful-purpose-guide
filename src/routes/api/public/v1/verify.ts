import { createFileRoute } from "@tanstack/react-router";
import { verifyProof } from "@/lib/akn.server";

export const Route = createFileRoute("/api/public/v1/verify")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const proof = url.searchParams.get("proof");
        if (!proof) {
          return Response.json(
            { ok: false, error: "missing ?proof=<hash>" },
            { status: 400, headers: { "Access-Control-Allow-Origin": "*" } },
          );
        }
        const triple = await verifyProof(proof);
        return Response.json(
          {
            ok: Boolean(triple),
            verified_at: new Date().toISOString(),
            triple,
          },
          {
            headers: {
              "Cache-Control": "public, max-age=30",
              "Access-Control-Allow-Origin": "*",
            },
          },
        );
      },
    },
  },
});
