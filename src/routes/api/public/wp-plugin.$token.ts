// GET /api/public/wp-plugin/{token}.zip
// Streams a personalized WordPress plugin zip with the install token pre-baked.
import { createFileRoute } from "@tanstack/react-router";
import { zipSync, strToU8 } from "fflate";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import pluginPhp from "../../../../wp-plugin/grow-auto-fix/grow-auto-fix.php?raw";
import readmeTxt from "../../../../wp-plugin/grow-auto-fix/readme.txt?raw";

function parse(raw: string) {
  const token = raw.endsWith(".zip") ? raw.slice(0, -4) : raw;
  return /^[0-9a-f-]{36}$/i.test(token) ? token : null;
}

export const Route = createFileRoute("/api/public/wp-plugin/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const token = parse(params.token);
        if (!token) return new Response("invalid token", { status: 400 });

        const { data: site } = await supabaseAdmin
          .from("intervention_sites")
          .select("id, domain")
          .eq("install_token", token)
          .maybeSingle();
        if (!site) return new Response("unknown site", { status: 404 });

        // Pre-bake the install token into the plugin so the user can install without pasting it.
        const personalizedPhp = pluginPhp.replace(
          "register_setting('grow_autofix', 'grow_autofix_token', [",
          `add_option('grow_autofix_token', '${token}');\nregister_setting('grow_autofix', 'grow_autofix_token', [`,
        );

        const zip = zipSync({
          "grow-auto-fix/grow-auto-fix.php": strToU8(personalizedPhp),
          "grow-auto-fix/readme.txt": strToU8(readmeTxt),
        }, { level: 6 });

        await supabaseAdmin.from("intervention_deliveries").insert({
          site_id: site.id,
          intervention_id: null,
          delivery_method: "wp_plugin_download",
        });

        return new Response(zip, {
          status: 200,
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="grow-auto-fix-${site.domain}.zip"`,
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
