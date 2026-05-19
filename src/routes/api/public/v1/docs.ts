import { createFileRoute } from "@tanstack/react-router";
import { CORS_HEADERS } from "@/lib/api/auth";

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Grow Public API — Docs</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
<style>body{margin:0;background:#fff}</style>
</head>
<body>
<div id="swagger"></div>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>
  window.ui = SwaggerUIBundle({
    url: "/api/public/v1/openapi.json",
    dom_id: "#swagger",
    persistAuthorization: true,
  });
</script>
</body>
</html>`;

export const Route = createFileRoute("/api/public/v1/docs")({
  server: {
    handlers: {
      GET: async () =>
        new Response(html, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8", ...CORS_HEADERS },
        }),
    },
  },
});
