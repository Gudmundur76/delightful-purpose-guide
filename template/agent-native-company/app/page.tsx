import { loadPage, extractFaq, extractPricing } from "@/lib/content";

export const dynamic = "force-static";

export default function HomePage() {
  const page = loadPage("index");
  const f = page.frontmatter;
  const faq = extractFaq(page.sections["FAQ"]);
  const pricing = extractPricing(page.sections["Pricing"]);
  const features = (page.sections["Features"] ?? "")
    .split("\n")
    .filter((l) => l.startsWith("- "))
    .map((l) => l.replace(/^-\s+/, ""));

  return (
    <main>
      <header className="border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-4">{f.category}</p>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">{f.name}</h1>
          <p className="text-xl text-slate-700 max-w-2xl leading-relaxed">{f.description}</p>
        </div>
      </header>

      {features.length > 0 && (
        <section className="border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <h2 className="text-2xl font-semibold mb-8">Features</h2>
            <ul className="grid md:grid-cols-2 gap-4">
              {features.map((feat, i) => (
                <li key={i} className="p-4 border border-slate-200 rounded-md" dangerouslySetInnerHTML={{ __html: feat.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
              ))}
            </ul>
          </div>
        </section>
      )}

      {pricing.length > 0 && (
        <section className="border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <h2 className="text-2xl font-semibold mb-8">Pricing</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {pricing.map((p) => (
                <article key={p.tier} className="p-6 border border-slate-200 rounded-md">
                  <h3 className="font-semibold text-lg">{p.tier}</h3>
                  <p className="text-3xl font-bold my-2">{p.price}</p>
                  <p className="text-sm text-slate-600">{p.features}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {faq.length > 0 && (
        <section>
          <div className="max-w-3xl mx-auto px-6 py-16">
            <h2 className="text-2xl font-semibold mb-8">Frequently asked</h2>
            <dl className="space-y-6">
              {faq.map((q, i) => (
                <div key={i}>
                  <dt className="font-semibold mb-1">{q.question}</dt>
                  <dd className="text-slate-700">{q.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      <footer className="border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-8 text-sm text-slate-500 flex justify-between">
          <span>© {new Date().getFullYear()} {f.name}</span>
          <span>Powered by <a href="https://grow.contact" className="underline">grow.contact</a></span>
        </div>
      </footer>
    </main>
  );
}
