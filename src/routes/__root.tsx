import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

import appCss from "../styles.css?url";
import { supabase } from "@/integrations/supabase/client";
import { CookieConsent } from "@/components/CookieConsent";
import { WebMcpProvider } from "@/components/WebMcpProvider";




function NotFoundComponent() {
  const [path, setPath] = useState("/this-page");
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPath(window.location.pathname || "/this-page");
      // Easter egg console log
      console.log(
        "%c⚡ Agent-native. Score: 100/100",
        "color:#22d3ee;font-family:monospace;font-weight:bold;font-size:13px",
      );
      console.log(
        "%c  curl /this-page → 404. Try: npm install agent-native",
        "color:#64748b;font-family:monospace;font-size:11px",
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl border border-border bg-card shadow-2xl">
        {/* Terminal chrome */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            grow@agent-shell ~ %
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">404</span>
        </div>

        {/* Terminal body */}
        <pre className="p-6 font-mono text-[13px] leading-relaxed overflow-x-auto whitespace-pre-wrap">
<span className="text-muted-foreground">user@grow:~$ </span><span className="text-foreground">curl https://grow.contact{path}</span>
{"\n"}<span className="text-red-400">curl: (22) The requested URL returned error: 404 Not Found</span>
{"\n"}
{"\n"}<span className="text-muted-foreground">user@grow:~$ </span><span className="text-foreground">echo $?</span>
{"\n"}<span className="text-yellow-400">404</span>
{"\n"}
{"\n"}<span className="text-muted-foreground">user@grow:~$ </span><span className="text-foreground">cat ./error.log</span>
{"\n"}<span className="text-red-400">[ERROR] Page not found.</span>
{"\n"}<span className="text-muted-foreground">[INFO]  This path was never indexed by humans or agents.</span>
{"\n"}<span className="text-muted-foreground">[INFO]  Exit code: </span><span className="text-red-400">404</span>
{"\n"}
{"\n"}<span className="text-muted-foreground">user@grow:~$ </span><span className="text-accent">_</span><span className="inline-block w-2 h-3.5 bg-accent ml-0.5 align-middle animate-[blink_1s_steps(2,start)_infinite]" />
        </pre>

        {/* CTA row */}
        <div className="px-6 py-5 border-t border-border flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            // hover the button — it knows the cure
          </p>
          <Link
            to="/"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setHovered(true)}
            onBlur={() => setHovered(false)}
            className="group relative inline-flex items-center gap-3 bg-accent text-accent-foreground font-bold px-5 py-3 uppercase tracking-tighter text-sm hover:bg-foreground hover:text-background transition-colors"
          >
            <span>cd /</span>
            <span className="font-mono text-[10px] opacity-70 group-hover:translate-x-1 transition-transform">
              →
            </span>
            {hovered && (
              <span
                role="tooltip"
                className="pointer-events-none absolute -top-10 right-0 bg-background border border-accent/60 text-accent px-3 py-1.5 font-mono text-[11px] whitespace-nowrap shadow-lg"
              >
                <span className="text-muted-foreground">&gt; </span>
                npm install agent-native
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}


function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google-site-verification", content: "HbTX1qSEq9ZU_E2EVtzo_mw84F9k2TnNr6uPAatkNYQ" },
      { title: "grow.contact — Free AI search visibility infrastructure" },
      { name: "description", content: "Free scanner, standard, MCP server, and WordPress plugin to get your site cited by ChatGPT, Perplexity, Claude, and Google AI. No paywall." },
      { name: "author", content: "grow.contact" },
      { property: "og:title", content: "grow.contact — Free AI search visibility infrastructure" },
      { property: "og:description", content: "Free scanner, standard, MCP server, and WordPress plugin. Get cited by ChatGPT, Perplexity, Claude, and Google AI. No paywall." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "grow.contact" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "grow.contact — Free AI search visibility infrastructure" },
      { name: "twitter:description", content: "Free scanner, standard, MCP server, WordPress plugin. Get cited by ChatGPT, Perplexity, Claude, Google AI." },


    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      // Typography: Inter for UI, Fira Code (with ligatures) for the dev/agent-native voice.
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&family=Fira+Code:wght@400;500;600&display=swap",
      },
      {
        rel: "alternate",
        type: "application/rss+xml",
        title: "grow.contact — Journal",
        href: "https://grow.contact/rss.xml",
      },
    ],

    scripts: [
      // Dogfood: our own AI-referral attribution script (free tool, no cookies).
      { src: "/api/public/ai-attribution.js", async: true },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Grow",
          url: "https://grow.contact",
          description: "Agent-native marketing sites for AI/ML startups, agent platforms, and developer tools. 48 hours, fixed price.",
        }),
      },
      // In-page discovery marker for DOM-based agents (Codex, Devin, Playwright
      // bots). One of the 5 signals in the vendor-neutral Agent-Web Discovery
      // Matrix — see /blog/agent-web-discovery-matrix and
      // /.well-known/agent-card.json for the full set.
      {
        type: "application/agent+json",
        children: JSON.stringify({
          name: "grow.contact",
          agentCard: "https://grow.contact/.well-known/agent-card.json",
          mcp: "https://grow.contact/api/public/mcp",
          mcpCard: "https://grow.contact/.well-known/mcp/server-card.json",
          llms: "https://grow.contact/llms.txt",
          standard: "https://grow.contact/standard.md",
          openapi: "https://grow.contact/openapi.json",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      queryClient.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <CookieConsent />
      <WebMcpProvider />
    </QueryClientProvider>
  );

}
