import { createFileRoute } from "@tanstack/react-router";
import fluxImg from "@/assets/portfolio-flux.jpg";
import architexImg from "@/assets/portfolio-architex.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "RapidEngine — Custom websites shipped in 48 hours" },
      {
        name: "description",
        content:
          "Productized web design agency powered by Lovable. Fixed-price custom websites and web apps delivered in 48 hours.",
      },
      { property: "og:title", content: "RapidEngine — Sites shipped in 48h" },
      {
        property: "og:description",
        content:
          "Custom-coded, high-performance websites delivered with mechanical precision.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs font-medium px-2 py-1 border border-accent text-accent tracking-tighter uppercase">
              Status: Ready
            </span>
            <span className="font-extrabold tracking-tighter text-xl uppercase">
              RapidEngine_
            </span>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <a href="#services" className="hover:text-foreground transition-colors">
                Services
              </a>
              <a href="#process" className="hover:text-foreground transition-colors">
                Process
              </a>
              <a href="#archive" className="hover:text-foreground transition-colors">
                Archive
              </a>
            </div>
            <a
              href="#cta"
              className="bg-foreground text-background text-xs font-bold px-4 py-2 uppercase tracking-tighter hover:bg-accent hover:text-accent-foreground transition-all"
            >
              Start Brief
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative border-b border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="grid md:grid-cols-12 gap-12 items-end">
            <div className="md:col-span-8 animate-in">
              <p className="font-mono text-accent text-xs mb-6 uppercase tracking-[0.2em]">
                // Zero-to-Live in 48 Hours
              </p>
              <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-balance leading-[0.9] mb-8">
                WE BUILD <span className="text-muted-foreground">FAST.</span>
                <br />
                YOU SCALE <span className="italic">NOW.</span>
              </h1>
              <div className="flex flex-wrap gap-4">
                <div className="px-6 py-4 bg-card border border-border flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">
                    Fixed Rate
                  </span>
                  <span className="text-2xl font-bold tracking-tighter">$2,400.00</span>
                </div>
                <div className="px-6 py-4 bg-card border border-border flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">
                    Delivery Window
                  </span>
                  <span className="text-2xl font-bold tracking-tighter">48:00:00</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-4 animate-in [animation-delay:150ms]">
              <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm">
                Custom-coded, high-performance websites delivered with mechanical
                precision. Powered by Lovable, engineered by specialists.
              </p>
              <a
                href="#cta"
                className="block text-center w-full py-4 border-2 border-foreground font-bold uppercase tracking-tighter hover:bg-foreground hover:text-background transition-colors"
              >
                Book Intro Call (15m)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
          {[
            { n: "01", t: "The Brief", d: "Submit your assets and requirements. No long meetings, just clear documentation." },
            { n: "02", t: "The Build", d: "Our engineers sprint for 48 hours. Real-time preview link provided within 12h." },
            { n: "03", t: "The Launch", d: "Final QA, SEO audit, and domain handover. Your site is live and lightning fast." },
          ].map((s, i) => (
            <div
              key={s.n}
              className="flex-1 p-10 animate-in"
              style={{ animationDelay: `${200 + i * 100}ms` }}
            >
              <span className="font-mono text-accent text-xs">{s.n}</span>
              <h3 className="text-xl font-bold mt-4 uppercase tracking-tighter">{s.t}</h3>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Portfolio */}
      <section id="archive" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-4xl font-extrabold tracking-tighter uppercase">
            Recent Outputs
          </h2>
          <span className="font-mono text-xs text-muted-foreground">V.03/26 Portfolio</span>
        </div>
        <div className="grid md:grid-cols-2 gap-px bg-border border border-border">
          <div className="bg-background p-4">
            <img
              src={fluxImg}
              alt="Flux Capital fintech dashboard"
              width={1280}
              height={960}
              loading="lazy"
              className="w-full aspect-[4/3] object-cover bg-card"
            />
            <div className="mt-4 flex justify-between items-center">
              <span className="font-bold uppercase tracking-tighter">
                Flux Capital Branding
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                LANDING PAGE // 48H
              </span>
            </div>
          </div>
          <div className="bg-background p-4">
            <img
              src={architexImg}
              alt="Architex Studio portfolio site"
              width={1280}
              height={960}
              loading="lazy"
              className="w-full aspect-[4/3] object-cover bg-card"
            />
            <div className="mt-4 flex justify-between items-center">
              <span className="font-bold uppercase tracking-tighter">
                Architex Studio
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                MARKETING SITE // 48H
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="services" className="bg-foreground text-background py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                tier: "Tier 01",
                name: "One-Pager",
                desc: "Perfect for product launches and simple portfolios.",
                price: "$2,400",
                features: ["+ 48hr Delivery", "+ Mobile Responsive", "+ Basic SEO"],
                accent: false,
                label: "Tier 01",
              },
              {
                tier: "Tier 02 // Most Popular",
                name: "Full Site",
                desc: "Up to 5 pages of bespoke design and high-speed engineering.",
                price: "$4,800",
                features: ["+ CMS Integration", "+ Custom Animations", "+ Priority Support"],
                accent: true,
                label: "Tier 02 // Most Popular",
              },
              {
                tier: "Tier 03",
                name: "Web App",
                desc: "Complex functionality, API integrations, and user auth.",
                price: "$8,500+",
                features: ["+ Backend Logic", "+ Database Setup", "+ 72hr Delivery"],
                accent: false,
                label: "Tier 03",
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`border-l-2 pl-8 ${p.accent ? "border-accent" : "border-background/20"}`}
              >
                <p
                  className={`font-mono text-[10px] uppercase mb-2 ${p.accent ? "text-accent" : "opacity-60"}`}
                >
                  {p.label}
                </p>
                <h3 className="text-3xl font-extrabold uppercase tracking-tighter">
                  {p.name}
                </h3>
                <p className="text-sm mt-4 opacity-80 h-12">{p.desc}</p>
                <p className="text-4xl font-bold tracking-tighter mt-8">{p.price}</p>
                <ul className="mt-8 space-y-2 text-xs font-mono uppercase tracking-tighter">
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ + CTA */}
      <footer id="cta" className="border-t border-border py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-24">
            <div>
              <h4 className="font-mono text-xs uppercase text-accent mb-8">
                // Frequently Asked Questions
              </h4>
              <div className="space-y-12">
                <div>
                  <p className="font-bold uppercase tracking-tighter text-lg">
                    How is 48 hours possible?
                  </p>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    We use a proprietary workflow powered by Lovable. We don't waste
                    time on endless revisions; we build it right the first time using
                    battle-tested technical frameworks.
                  </p>
                </div>
                <div>
                  <p className="font-bold uppercase tracking-tighter text-lg">
                    What if I need changes?
                  </p>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    Every build includes one 4-hour revision block after delivery to
                    polish the details and ensure perfection.
                  </p>
                </div>
                <div>
                  <p className="font-bold uppercase tracking-tighter text-lg">
                    Do I own the code?
                  </p>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    Yes. Full GitHub repository handover. The site is yours to host,
                    modify, and extend.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-accent p-12 flex flex-col justify-between">
              <h2 className="text-4xl font-extrabold tracking-tighter uppercase text-accent-foreground leading-none">
                Ready to
                <br />
                ship your
                <br />
                vision?
              </h2>
              <div className="mt-12 space-y-4">
                <button className="w-full py-4 bg-background text-foreground font-bold uppercase tracking-tighter hover:bg-card transition-colors">
                  Start Project Brief
                </button>
                <p className="font-mono text-[10px] text-accent-foreground/70 uppercase text-center tracking-widest">
                  Next available slot: Today, 14:00 UTC
                </p>
              </div>
            </div>
          </div>
          <div className="mt-24 pt-8 border-t border-border flex justify-between font-mono text-[10px] text-muted-foreground uppercase">
            <span>&copy; 2026 RAPIDENGINE STUDIO</span>
            <span>Powering 48H Innovation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
