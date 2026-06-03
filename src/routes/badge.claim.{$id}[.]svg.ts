import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const COLORS: Record<string, string> = {
  supported: "#10b981",
  partially_supported: "#84cc16",
  ambiguous: "#eab308",
  needs_expert_review: "#eab308",
  insufficient_evidence: "#f59e0b",
  out_of_scope: "#a1a1aa",
  unverified: "#71717a",
  contradicted: "#ef4444",
};

const LABELS: Record<string, string> = {
  supported: "VERIFIED",
  partially_supported: "PARTIAL",
  ambiguous: "AMBIGUOUS",
  needs_expert_review: "REVIEW",
  insufficient_evidence: "INSUFFICIENT",
  out_of_scope: "OUT OF SCOPE",
  unverified: "UNVERIFIED",
  contradicted: "CONTRADICTED",
};

function escapeXml(s: string) {
  return s.replace(/[<>&"']/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c]!),
  );
}

function svg(verdict: string, entity: string, value: string) {
  const color = COLORS[verdict] ?? "#71717a";
  const label = LABELS[verdict] ?? verdict.toUpperCase();
  const display = escapeXml(`${entity}${value ? `: ${value}` : ""}`).slice(0, 60);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 56" width="260" height="56">
  <rect width="260" height="56" rx="6" fill="#0a0a0a" stroke="#27272a"/>
  <rect x="0" y="0" width="6" height="56" fill="${color}"/>
  <text x="18" y="20" fill="${color}" font-size="9" font-weight="700" letter-spacing="1.4" font-family="ui-monospace,monospace">${label}</text>
  <text x="18" y="36" fill="#fafafa" font-size="11" font-weight="600" font-family="ui-sans-serif,system-ui,sans-serif">${display}</text>
  <text x="18" y="49" fill="#71717a" font-size="8" font-family="ui-monospace,monospace">grow.contact/claim</text>
</svg>`;
}

export const Route = createFileRoute("/badge/claim/{$id}.svg")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { data } = await supabaseAdmin
          .from("site_claims")
          .select("verdict, entity, value")
          .eq("id", params.id)
          .maybeSingle();

        const verdict = data?.verdict ?? "unverified";
        const entity = data?.entity ?? "Unknown claim";
        const value = data?.value ?? "";

        return new Response(svg(verdict, entity, value), {
          status: 200,
          headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=300",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
