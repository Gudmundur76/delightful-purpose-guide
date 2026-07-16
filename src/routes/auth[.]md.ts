// /auth.md — describes how AI agents authenticate to the grow.contact public API.
// Required by the agent-readiness "auth.md" check; must include an `# auth.md` heading.
import { createFileRoute } from "@tanstack/react-router";
import { authMarkdown, buildLinkHeader } from "../lib/agent-protocol";

const body = authMarkdown();

export const Route = createFileRoute("/auth.md")({
  server: {
    handlers: {
      GET: async () =>
        new Response(body, {
          status: 200,
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=3600",
            "Access-Control-Allow-Origin": "*",
            Link: buildLinkHeader(),
          },
        }),
    },
  },
});
