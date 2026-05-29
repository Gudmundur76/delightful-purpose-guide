import { createFileRoute } from "@tanstack/react-router";
import { getCompanyIntelligence } from "@/lib/intelligence/company.functions";
import { jsonResponse, optionsResponse, requireApiKey } from "@/lib/api/auth";

export const Route = createFileRoute("/api/public/v1/companies/$domain")({
  server: {
    handlers: {
      OPTIONS: async () => optionsResponse(),
      GET: async ({ request, params }) => {
        const unauth = requireApiKey(request);
        if (unauth) return unauth;

        const raw = (params as { domain: string }).domain ?? "";
        const domain = raw
          .toLowerCase()
          .trim()
          .replace(/^https?:\/\//, "")
          .replace(/^www\./, "")
          .replace(/\/.*$/, "");

        if (!domain || domain.length > 253 || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
          return jsonResponse({ error: "Invalid domain" }, 400);
        }

        try {
          const { intelligence } = await getCompanyIntelligence({ data: { domain } });
          if (!intelligence) {
            return jsonResponse({ error: "Company not found", domain }, 404);
          }
          return jsonResponse({ data: intelligence, generated_at: new Date().toISOString() });
        } catch (err) {
          console.error("[api/v1/companies/:domain] failed", err);
          return jsonResponse({ error: "Internal server error" }, 500);
        }
      },
    },
  },
});
