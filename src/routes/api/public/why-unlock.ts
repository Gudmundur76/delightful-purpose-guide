import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizeDomain } from "@/lib/interventions/shared.server";

const Body = z.object({
  domain: z.string().min(3).max(255),
  email: z.string().email().max(255),
});

export const Route = createFileRoute("/api/public/why-unlock")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try { parsed = Body.parse(await request.json()); }
        catch { return Response.json({ error: "domain and valid email required" }, { status: 400 }); }
        const domain = normalizeDomain(parsed.domain);

        await supabaseAdmin
          .from("intervention_sites")
          .update({
            report_unlocked: true,
            report_unlocked_at: new Date().toISOString(),
            report_email: parsed.email,
          })
          .eq("domain", domain);

        // Lead capture
        await supabaseAdmin.from("leads").insert({
          email: parsed.email,
          name: parsed.email.split("@")[0],
          message: `why.grow report unlock: ${domain}`,
          source: "why_report",
          budget_tier: "unknown",
        });

        return Response.json({ ok: true, report_url: `/why/${domain}` });
      },
    },
  },
});
