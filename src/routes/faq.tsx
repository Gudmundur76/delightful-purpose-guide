import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getFaqItemsFn } from "@/lib/site/content.functions";


// Fallback only used if the DB returns no rows (e.g. cold-start error).
const FALLBACK_FAQS: { q: string; a: string }[] = [
  { q: "What does \"agent-native\" actually mean?", a: "Every page ships with semantic HTML, JSON-LD (Organization, Product, FAQ, BreadcrumbList), an llms.txt at the root, OpenGraph + Twitter cards, and a clean sitemap. The result: ChatGPT, Perplexity, Claude, and Google AI Overviews can read, cite, and link to your product without guessing." },
  { q: "Who is this actually for?", a: "AI/ML startups (model APIs, infra, eval tools), agent platforms (orchestration, browser agents, voice), and developer tools (SDKs, CLIs, MCP servers). If your buyer is a technical founder or platform engineer, you're in the right place." },
  { q: "How much does it cost, and what's included?", a: "Fixed price per tier — no hourly surprises. Each build includes design, custom code, on-page SEO, responsive layouts, and deployment. Copy and stock imagery are on you; we can recommend writers if you need one." },
];

export const Route = createFileRoute("/faq")({
  component: FaqPage,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["faq-items"],
      queryFn: () => getFaqItemsFn(),
    });
  },
  head: () => ({
    meta: [
      { title: "FAQ — Grow" },
      { name: "description", content: "Answers to common questions about agent-native sites, pricing, timelines, and ownership." },
      { property: "og:title", content: "FAQ — Grow" },
      { property: "og:description", content: "What 'agent-native' means, how 48h works, pricing, ownership, and more." },
      { property: "og:url", content: "https://grow.contact/faq" },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/faq" }],
    // FAQPage JSON-LD is rendered inside the component from the same data
    // source the UI uses, so visible Q&A and structured data cannot drift.
  }),
});

function FaqPage() {
  const fetchFaq = useServerFn(getFaqItemsFn);
  const { data } = useQuery({
    queryKey: ["faq-items"],
    queryFn: () => fetchFaq(),
  });
  const items = (data && data.length > 0)
    ? data.map((d) => ({ q: d.question, a: d.answer }))
    : FALLBACK_FAQS;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
      <main>
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
            <p className="font-mono text-accent text-xs mb-4 uppercase tracking-[0.2em]">// Questions</p>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter uppercase">FAQ</h1>
          </div>
        </section>
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="space-y-8 sm:space-y-10">
            {items.map((f) => (
              <div key={f.q}>
                <p className="font-bold uppercase tracking-tighter text-base sm:text-lg">{f.q}</p>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 border-t border-border pt-10 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">// Ready?</p>
            <Link to="/contact" className="inline-flex items-center gap-3 bg-accent text-accent-foreground font-bold px-6 py-4 uppercase tracking-tighter text-sm hover:bg-foreground hover:text-background transition-colors">
              Start a Brief →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}


