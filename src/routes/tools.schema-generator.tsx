import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";
import { useMemo, useState } from "react";
import { Copy } from "lucide-react";

const URL_ = "https://grow.contact/tools/schema-generator";
const TITLE = "Free JSON-LD schema generator — Organization, FAQ, Article";
const DESC =
  "Build the JSON-LD blocks AI engines and Google actually read. Organization, FAQPage, and Article schemas from a form. Copy-paste into your <head>. Free, no signup.";

type SchemaKind = "Organization" | "FAQPage" | "Article";

export const Route = createFileRoute("/tools/schema-generator")({
  component: SchemaGen,
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
        title: "Free JSON-LD schema generator",
        kicker: "grow.contact / tools",
        sub: "Organization, FAQPage, and Article schemas from a form. Copy-paste and ship.",
      }),
    ],
    links: [{ rel: "canonical", href: URL_ }],
  }),
});

function SchemaGen() {
  const [kind, setKind] = useState<SchemaKind>("Organization");

  // Organization
  const [orgName, setOrgName] = useState("Acme Inc.");
  const [orgUrl, setOrgUrl] = useState("https://acme.com");
  const [orgLogo, setOrgLogo] = useState("https://acme.com/logo.png");
  const [orgSameAs, setOrgSameAs] = useState("https://x.com/acme, https://linkedin.com/company/acme");

  // FAQ
  const [faq, setFaq] = useState([
    { q: "What does Acme do?", a: "Acme makes tools that help teams ship faster." },
    { q: "Is Acme free?", a: "Yes — the core product is free with no signup." },
  ]);

  // Article
  const [artHeadline, setArtHeadline] = useState("How AI engines cite websites in 2026");
  const [artUrl, setArtUrl] = useState("https://acme.com/blog/how-ai-cites");
  const [artAuthor, setArtAuthor] = useState("Jane Doe");
  const [artPub, setArtPub] = useState(new Date().toISOString().slice(0, 10));
  const [artImage, setArtImage] = useState("https://acme.com/cover.jpg");

  const json = useMemo(() => {
    if (kind === "Organization") {
      const sameAs = orgSameAs
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: orgName,
        url: orgUrl,
        logo: orgLogo,
        ...(sameAs.length ? { sameAs } : {}),
      };
    }
    if (kind === "FAQPage") {
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq
          .filter((x) => x.q && x.a)
          .map((x) => ({
            "@type": "Question",
            name: x.q,
            acceptedAnswer: { "@type": "Answer", text: x.a },
          })),
      };
    }
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: artHeadline,
      mainEntityOfPage: artUrl,
      image: artImage ? [artImage] : undefined,
      datePublished: artPub,
      dateModified: artPub,
      author: { "@type": "Person", name: artAuthor },
    };
  }, [kind, orgName, orgUrl, orgLogo, orgSameAs, faq, artHeadline, artUrl, artAuthor, artPub, artImage]);

  const jsonStr = JSON.stringify(json, null, 2);
  const embed = `<script type="application/ld+json">\n${jsonStr}\n</script>`;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border">
          <div className="mx-auto max-w-5xl px-6 py-14">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Free tool</p>
            <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              JSON-LD schema generator
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Fill a form. Copy the JSON-LD. Paste it inside your{" "}
              <code className="text-foreground">&lt;head&gt;</code>. Works with Google, AI engines,
              and every schema.org consumer.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-10 grid md:grid-cols-2 gap-8">
          <div>
            <div className="mb-4 flex gap-2">
              {(["Organization", "FAQPage", "Article"] as SchemaKind[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  className={`rounded-md border px-3 py-1.5 text-xs ${
                    kind === k
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            {kind === "Organization" && (
              <div className="space-y-3">
                <Field label="Name" value={orgName} onChange={setOrgName} />
                <Field label="URL" value={orgUrl} onChange={setOrgUrl} />
                <Field label="Logo URL" value={orgLogo} onChange={setOrgLogo} />
                <Field
                  label="Same-as URLs (comma or newline separated)"
                  value={orgSameAs}
                  onChange={setOrgSameAs}
                  textarea
                />
              </div>
            )}

            {kind === "FAQPage" && (
              <div className="space-y-4">
                {faq.map((row, i) => (
                  <div key={i} className="rounded-md border border-border p-3 space-y-2">
                    <Field
                      label={`Q${i + 1}`}
                      value={row.q}
                      onChange={(v) =>
                        setFaq((prev) => prev.map((r, j) => (j === i ? { ...r, q: v } : r)))
                      }
                    />
                    <Field
                      label={`A${i + 1}`}
                      value={row.a}
                      onChange={(v) =>
                        setFaq((prev) => prev.map((r, j) => (j === i ? { ...r, a: v } : r)))
                      }
                      textarea
                    />
                    {faq.length > 1 && (
                      <button
                        onClick={() => setFaq((prev) => prev.filter((_, j) => j !== i))}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setFaq((prev) => [...prev, { q: "", a: "" }])}
                  className="rounded border border-border px-3 py-1.5 text-xs hover:border-primary"
                >
                  Add question
                </button>
              </div>
            )}

            {kind === "Article" && (
              <div className="space-y-3">
                <Field label="Headline" value={artHeadline} onChange={setArtHeadline} />
                <Field label="Canonical URL" value={artUrl} onChange={setArtUrl} />
                <Field label="Author name" value={artAuthor} onChange={setArtAuthor} />
                <Field label="Published date (YYYY-MM-DD)" value={artPub} onChange={setArtPub} />
                <Field label="Cover image URL" value={artImage} onChange={setArtImage} />
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Copy this</h2>
              <button
                onClick={() => navigator.clipboard.writeText(embed)}
                className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs hover:border-primary"
              >
                <Copy className="h-3 w-3" /> Copy &lt;script&gt;
              </button>
            </div>
            <pre className="max-h-[560px] overflow-auto rounded-md border border-border bg-card p-4 text-xs leading-relaxed whitespace-pre-wrap">
              {embed}
            </pre>
            <p className="mt-3 text-xs text-muted-foreground">
              Validate with Google&apos;s Rich Results Test or Schema.org validator before shipping.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
        />
      )}
    </label>
  );
}
