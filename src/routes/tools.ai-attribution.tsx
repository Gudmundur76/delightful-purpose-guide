import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";
import { AI_SOURCES, classify } from "@/lib/attribution/sources";
import { Check, Copy, Radar } from "lucide-react";

const URL_ = "https://grow.contact/tools/ai-attribution";
const TITLE = "AI traffic attribution — see which AI sent the visitor";
const DESC =
  "A free 1 KB script that labels every visit from ChatGPT, Perplexity, Claude, Gemini, Copilot and 7 more engines, then pushes the event into GA4, Plausible, PostHog or your own dashboard. No signup, no cookies, MIT.";

const SNIPPET = `<script async src="https://grow.contact/api/public/ai-attribution.js"></script>`;

const READ_SNIPPET = `window.addEventListener("grow:attribution", (e) => {
  // e.detail = { isAi, source, label, referrer, utm_source, landing_page, first_touch }
  if (e.detail.isAi) console.log("AI referral from", e.detail.label);
});`;

export const Route = createFileRoute("/tools/ai-attribution")({
  component: AiAttribution,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL_ },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      ...ogImageMeta({
        title: "AI traffic attribution — free 1 KB script",
        kicker: "grow.contact / tools",
        sub: "Label every visit from ChatGPT, Perplexity, Claude, Gemini and 8 more engines. Pushes to GA4, Plausible, PostHog. MIT, no signup.",
      }),
    ],
    links: [{ rel: "canonical", href: URL_ }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "@id": URL_,
          name: "AI Traffic Attribution Script",
          description: DESC,
          url: URL_,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any (web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "How do I know if traffic came from ChatGPT?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "AI assistants send a normal HTTP referrer — chatgpt.com, perplexity.ai, claude.ai, gemini.google.com and so on. The script reads document.referrer plus utm_source, matches it against a maintained list of 12 answer engines, and emits an ai_referral event your analytics can group on.",
              },
            },
            {
              "@type": "Question",
              name: "Does it use cookies or send data to grow.contact?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "No. Classification happens entirely in the browser and the result is pushed only into analytics tools you already run. First-touch source is kept in localStorage on the visitor's own device. Nothing is sent to grow.contact.",
              },
            },
            {
              "@type": "Question",
              name: "Which analytics tools does it support?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Google Tag Manager (dataLayer), GA4 (gtag), Plausible, PostHog and Fathom are detected automatically. For anything else, listen for the grow:attribution DOM event or read window.growAttribution.",
              },
            },
          ],
        }),
      },
    ],
  }),
});

function CopyBox({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        <button
          type="button"
          aria-label={`Copy ${label}`}
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-xs leading-relaxed text-foreground/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function AiAttribution() {
  const [referrer, setReferrer] = useState("");
  const [utm, setUtm] = useState("");

  useEffect(() => {
    setReferrer(document.referrer || "");
    try {
      setUtm(new URLSearchParams(window.location.search).get("utm_source") ?? "");
    } catch {
      /* noop */
    }
  }, []);

  const hit = useMemo(() => classify(referrer, utm), [referrer, utm]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Free tool</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
              See which AI sent the visitor.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Getting cited is only half the story — you also want to know when a citation turns
              into a visit. Drop in one script tag and every arrival from ChatGPT, Perplexity,
              Claude, Gemini, Copilot and eight more engines is labelled and pushed straight into
              the analytics you already use. It runs in the browser, sets no cookies, and sends
              nothing back to us.
            </p>
            <time className="mt-4 block text-xs text-muted-foreground" dateTime="2026-08-06">
              Updated August 6, 2026
            </time>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-12 space-y-10">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Radar className="h-4 w-4 text-primary" aria-hidden /> Your current visit
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              This is exactly what the script would report for you right now.
            </p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Referrer</dt>
                <dd className="mt-1 break-all font-mono text-xs">{referrer || "— (direct)"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">utm_source</dt>
                <dd className="mt-1 break-all font-mono text-xs">{utm || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Classified as</dt>
                <dd className="mt-1 font-medium">
                  {hit ? (
                    <span className="text-primary">{hit.label}</span>
                  ) : (
                    "Not AI traffic"
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Install it in one line</h2>
            <p className="text-muted-foreground">
              Paste this before <code className="font-mono text-xs">&lt;/body&gt;</code> on every
              page. It is about 1 KB, loads async, and never blocks rendering.
            </p>
            <CopyBox code={SNIPPET} label="script tag" />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Where the data lands</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Google Tag Manager</strong> — pushes{" "}
                <code className="font-mono text-xs">event: "ai_referral"</code> to{" "}
                <code className="font-mono text-xs">dataLayer</code>.
              </li>
              <li>
                <strong className="text-foreground">GA4</strong> — fires{" "}
                <code className="font-mono text-xs">gtag("event", "ai_referral", …)</code> when gtag
                is present.
              </li>
              <li>
                <strong className="text-foreground">Plausible, PostHog, Fathom</strong> — a custom
                event with the engine as a property.
              </li>
              <li>
                <strong className="text-foreground">Anything else</strong> — read{" "}
                <code className="font-mono text-xs">window.growAttribution</code> or listen for the
                event below.
              </li>
            </ul>
            <CopyBox code={READ_SNIPPET} label="read the result" />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              Engines we detect ({AI_SOURCES.length})
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {AI_SOURCES.map((s) => (
                <div key={s.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium">{s.label}</span>
                    <code className="font-mono text-[11px] text-muted-foreground">{s.id}</code>
                  </div>
                  <p className="mt-2 break-all font-mono text-[11px] text-muted-foreground">
                    {s.hosts.join(" · ")}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Missing an engine?{" "}
              <a href="/contact" className="text-primary hover:underline">
                Tell us
              </a>{" "}
              and we'll add it — the list is served from one endpoint, so every site using the
              script picks it up automatically.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Privacy, plainly</h2>
            <p className="text-muted-foreground">
              Classification is pure client-side string matching against{" "}
              <code className="font-mono text-xs">document.referrer</code> and{" "}
              <code className="font-mono text-xs">utm_source</code>. No cookies, no fingerprinting,
              no request back to grow.contact after the script loads. First-touch engine is stored
              in the visitor's own <code className="font-mono text-xs">localStorage</code> so you can
              attribute a later conversion to the AI that started it. MIT licensed — read or fork the{" "}
              <a
                href="/api/public/ai-attribution.js"
                className="text-primary hover:underline"
                rel="nofollow"
              >
                source
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
