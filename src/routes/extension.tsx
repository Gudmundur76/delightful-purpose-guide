import { createFileRoute } from "@tanstack/react-router";

const TITLE = "Grow GEO Browser Extension — One-Click Agent Readability Score";
const DESC =
  "See how AI agents read any website. Free Chrome/Edge/Brave extension. GEO + AEO score in your toolbar, top fixes, one click to the full report.";
const PAGE_URL = "https://grow.contact/extension";

export const Route = createFileRoute("/extension")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: PAGE_URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Grow GEO Browser Extension",
          applicationCategory: "BrowserApplication",
          operatingSystem: "Chrome, Edge, Brave, Arc, Opera",
          description: DESC,
          url: PAGE_URL,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          publisher: { "@type": "Organization", name: "Grow", url: "https://grow.contact" },
        }),
      },
    ],
  }),
  component: ExtensionPage,
});

function downloadZip() {
  fetch("/grow-geo.zip")
    .then((res) => {
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      return res.blob();
    })
    .then((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "grow-geo.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    })
    .catch((err) => alert(err.message));
}


function ExtensionPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Browser extension · MV3 · Free</p>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
          One-click agent readability score, on every page you visit.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Install the Grow GEO extension to see how AI agents — ChatGPT, Claude, Perplexity, Gemini — read the site you're
          looking at. Five sub-scores, top three fixes, one click to the full report.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-8 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            type="button"
            onClick={downloadZip}
            className="inline-flex items-center justify-center rounded-lg bg-foreground text-background px-5 py-3 text-sm font-semibold hover:opacity-90"
          >
            Download grow-geo.zip
          </button>
          <a
            href="/check"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Or run a one-off scan on the web →
          </a>
        </div>

        <ol className="mt-8 space-y-3 text-sm text-muted-foreground list-decimal list-inside">
          <li>Unzip the downloaded file.</li>
          <li>
            Open <code className="font-mono">chrome://extensions</code> (or <code className="font-mono">edge://extensions</code>,{" "}
            <code className="font-mono">brave://extensions</code>).
          </li>
          <li>
            Enable <strong>Developer mode</strong> in the top-right.
          </li>
          <li>
            Click <strong>Load unpacked</strong> and select the unzipped <code className="font-mono">grow-geo</code> folder.
          </li>
          <li>Pin the extension and click it on any page.</li>
        </ol>
      </section>

      <section className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-2">What it shows</h2>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Overall GEO score (0–100)</li>
            <li>Semantic HTML, JSON-LD, llms.txt, Citability, Speed</li>
            <li>Top 3 actionable fixes</li>
            <li>Deep link to the full report</li>
          </ul>
        </div>
        <div className="rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-2">Privacy &amp; limits</h2>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Only scans the active tab when you click the icon</li>
            <li>No tracking; an anonymous install ID for rate limiting</li>
            <li>60 scans/hour/install</li>
            <li>Works in any Chromium browser (Chrome, Edge, Brave, Arc, Opera)</li>
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-border p-6">
        <h2 className="font-semibold mb-3">Coming to the Chrome Web Store</h2>
        <p className="text-sm text-muted-foreground">
          We're submitting to the Chrome Web Store, Firefox Add-ons and Edge Add-ons. Until then, the unpacked install above
          gives you the same MV3 build.
        </p>
      </section>
    </main>
  );
}
