import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { jsonResponse, optionsResponse, requireApiKey } from "@/lib/api/auth";

const LeadSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  budget_tier: z.string().trim().min(1).max(50),
  message: z.string().trim().min(1).max(2000),
});

export const Route = createFileRoute("/api/public/v1/leads")({
  server: {
    handlers: {
      OPTIONS: async () => optionsResponse(),

      // GET removed: returning lead PII via a shared API key would expose
      // every contact form submission (name, email, message) to any key
      // holder. Leads are accessed via the internal admin endpoint instead.



      POST: async ({ request }) => {
        const unauth = requireApiKey(request);
        if (unauth) return unauth;
        let json: unknown;
        try {
          json = await request.json();
        } catch {
          return jsonResponse({ error: "Invalid JSON body" }, 400);
        }
        const parsed = LeadSchema.safeParse(json);
        if (!parsed.success) {
          return jsonResponse(
            { error: "Invalid input", details: parsed.error.flatten() },
            400,
          );
        }
        const { data, error } = await supabaseAdmin
          .from("leads")
          .insert(parsed.data)
          .select("id, created_at")
          .single();
        if (error) {
          console.error("leads POST failed", error);
          return jsonResponse({ error: "Failed to create lead" }, 500);
        }
        // Intentionally do NOT echo PII (name, email, message) back to the
        // caller — PUBLIC_API_KEY is shared with external consumers.
        return jsonResponse({ lead: data }, 201);
      },
    },
  },
});
