import { createFileRoute } from "@tanstack/react-router";
import { AI_SOURCES } from "@/lib/attribution/sources";

const TABLE = JSON.stringify(
  AI_SOURCES.map((s) => ({ id: s.id, label: s.label, hosts: s.hosts, utm: s.utm })),
);

const SCRIPT = `/*! grow.contact AI attribution — free, MIT. https://grow.contact/tools/ai-attribution */
(function () {
  var SOURCES = ${TABLE};
  var KEY = "grow_ai_attribution";

  function classify(ref, utm) {
    ref = (ref || "").toLowerCase();
    utm = (utm || "").toLowerCase();
    for (var i = 0; i < SOURCES.length; i++) {
      var s = SOURCES[i];
      for (var u = 0; u < s.utm.length; u++) {
        if (utm && (utm === s.utm[u] || utm.indexOf(s.utm[u]) !== -1)) return s;
      }
      for (var h = 0; h < s.hosts.length; h++) {
        if (ref && ref.indexOf(s.hosts[h]) !== -1) return s;
      }
    }
    return null;
  }

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; }
  }

  var params;
  try { params = new URLSearchParams(location.search); } catch (e) { params = null; }
  var utm = params ? params.get("utm_source") : null;
  var hit = classify(document.referrer, utm);

  var stored = read();
  var detail = {
    isAi: !!hit,
    source: hit ? hit.id : null,
    label: hit ? hit.label : null,
    referrer: document.referrer || null,
    utm_source: utm || null,
    landing_page: location.pathname + location.search,
    ts: new Date().toISOString(),
    first_touch: stored && stored.source ? stored : null
  };

  if (hit && (!stored || !stored.source)) {
    try { localStorage.setItem(KEY, JSON.stringify({ source: hit.id, label: hit.label, landing_page: detail.landing_page, ts: detail.ts })); } catch (e) {}
    detail.first_touch = detail.first_touch || { source: hit.id, label: hit.label, landing_page: detail.landing_page, ts: detail.ts };
  }

  window.growAttribution = detail;

  if (hit) {
    var payload = { source: hit.id, label: hit.label, referrer: detail.referrer, landing_page: detail.landing_page };
    try { window.dataLayer = window.dataLayer || []; window.dataLayer.push(Object.assign({ event: "ai_referral" }, payload)); } catch (e) {}
    try { if (typeof window.gtag === "function") window.gtag("event", "ai_referral", payload); } catch (e) {}
    try { if (typeof window.plausible === "function") window.plausible("AI referral", { props: payload }); } catch (e) {}
    try { if (window.posthog && typeof window.posthog.capture === "function") window.posthog.capture("ai_referral", payload); } catch (e) {}
    try { if (window.Fathom && typeof window.Fathom.trackEvent === "function") window.Fathom.trackEvent("AI referral: " + hit.label); } catch (e) {}
    try { document.documentElement.setAttribute("data-ai-source", hit.id); } catch (e) {}
  }

  try { window.dispatchEvent(new CustomEvent("grow:attribution", { detail: detail })); } catch (e) {}
})();
`;

export const Route = createFileRoute("/api/public/ai-attribution.js")({
  server: {
    handlers: {
      GET: async () =>
        new Response(SCRIPT, {
          status: 200,
          headers: {
            "Content-Type": "application/javascript; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
            "Access-Control-Allow-Origin": "*",
          },
        }),
    },
  },
});
