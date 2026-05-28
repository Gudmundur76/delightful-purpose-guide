// Agent Action endpoint — called by MCP, Skywork, n8n with a bearer token.
// POST { tool, params, client_id }  →  { success, result, error }
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { executeTool } from "@/lib/composio/composio.server";

const Body = z.object({
  tool: z.string().min(1).max(256).regex(/^[A-Za-z0-9_\-:./]+$/),
  client_id: z.string().uuid(),
  params: z.record(z.string(), z.unknown()).default({}),
});

function unauthorized(msg: string) {
  return new Response(JSON.stringify({ success: false, error: msg }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

function bad(msg: string, status = 400) {
  return new Response(JSON.stringify({ success: false, error: msg }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/agent-action")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Bearer auth: ADMIN_API_KEY (MCP) or PUBLIC_API_KEY (Skywork/n8n).
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.toLowerCase().startsWith("bearer ")
          ? auth.slice(7).trim()
          : "";
        const adminKey = process.env.ADMIN_API_KEY;
        const publicKey = process.env.PUBLIC_API_KEY;
        if (!token) return unauthorized("Missing bearer token");
        if (!(adminKey && token === adminKey) && !(publicKey && token === publicKey)) {
          return unauthorized("Invalid bearer token");
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return bad("Invalid JSON body");
        }
        const parsed = Body.safeParse(body);
        if (!parsed.success) {
          return bad(`Invalid body: ${parsed.error.message}`);
        }

        const out = await executeTool(parsed.data.tool, parsed.data.client_id, parsed.data.params);
        return new Response(JSON.stringify(out), {
          status: out.success ? 200 : 502,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
