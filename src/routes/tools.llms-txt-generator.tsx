import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { generateLlmsTxt } from "@/lib/tools/llms-generator.functions";
import { Copy, Download, Loader2 } from "lucide-react";

const URL_ = "https://grow.contact/tools/llms-txt-generator";
const TITLE = "Free llms.txt generator — spec-compliant, from any sitemap";
const DESC =
  "Paste any domain. We read your sitemap and return a clean, spec-compliant llms.txt grouped by section. Free, no signup, no email — copy or download and paste at the root of your site.";

export const Route = createFileRoute("/tools/llms-txt-generator")({
  component: LlmsGen,
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
        title: "Free llms.txt generator",
        kicker: "grow.contact / tools",
        sub: "Point us at a domain. Get a spec-compliant llms.txt grouped by section, ready to paste at the root.",
      }),
    ],
    links: [{ rel: "canonical", href: URL_ }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "llms.txt Generator",
          url: URL_,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any (web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
});

function LlmsGen() {
  const [url, setUrl] = useState("");
  const runFn = useServerFn(generateLlmsTxt);
  const mut = useMutation({
    mutationFn: async (u: string) => runFn({ data: { url: u } }),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let u = url.trim();
    if (!u) return;
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
    mut.mutate(u);
  };

  const copy = (text: string) => navigator.clipboard.writeText(text);
  const download = (text: string, name: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const data = mut.data;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border">
          <div className="mx-auto max-w-4xl px-6 py-14">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Free tool</p>
            <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              llms.txt generator
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              We fetch your sitemap, group URLs by section, and return a spec-compliant{" "}
              <code className="text-foreground">llms.txt</code>. Paste it at{" "}
              <code className="text-foreground">/llms.txt</code> on your site.
            </p>

            <form onSubmit={onSubmit} className="mt-6 flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="example.com"
                className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                aria-label="Website URL"
              />
              <button
                type="submit"
                disabled={mut.isPending}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Generate
              </button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">
              Free. No signup. We only read your public sitemap and robots.txt.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-10">
          {mut.isError && (
            <p className="text-sm text-destructive">
              Something went wrong. Check that the URL is public and try again.
            </p>
          )}

          {data && !data.ok && (
            <div className="rounded-md border border-border bg-card p-4 text-sm">
              <p className="font-medium">Couldn't generate llms.txt</p>
              <p className="mt-1 text-muted-foreground">{data.message}</p>
            </div>
          )}

          {data && data.ok && (
            <div className="space-y-6">
              <div className="rounded-md border border-border bg-card p-4">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-muted-foreground">Origin:</span>{" "}
                    <span className="font-medium">{data.origin}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {data.urlCount} URLs · {data.sections.length} sections
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide">llms.txt</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copy(data.llmsTxt)}
                      className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs hover:border-primary"
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                    <button
                      onClick={() => download(data.llmsTxt, "llms.txt")}
                      className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs hover:border-primary"
                    >
                      <Download className="h-3 w-3" /> Download
                    </button>
                  </div>
                </div>
                <pre className="max-h-[520px] overflow-auto rounded-md border border-border bg-card p-4 text-xs leading-relaxed whitespace-pre-wrap">
                  {data.llmsTxt}
                </pre>
              </div>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
