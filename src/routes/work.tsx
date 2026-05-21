import { createFileRoute } from "@tanstack/react-router";
import { CaseStudies } from "@/components/CaseStudies";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import nimbusImg from "@/assets/portfolio-nimbus.jpg";
import vectorImg from "@/assets/portfolio-vector.jpg";

export const Route = createFileRoute("/work")({
  component: WorkPage,
  head: () => ({
    meta: [
      { title: "Work — Grow" },
      { name: "description", content: "Case studies and recent outputs: agent-native sites for AI startups and devtools." },
      { property: "og:title", content: "Work — Grow" },
      { property: "og:description", content: "Selected case studies and recent shipped sites." },
      { property: "og:url", content: "https://grow.contact/work" },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/work" }],
  }),
});

function WorkPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-accent text-xs mb-4 uppercase tracking-[0.2em]">// Archive</p>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter uppercase">Work</h1>
          </div>
        </section>
        <CaseStudies />
        <section className="max-w-7xl mx-auto px-6 py-16 sm:py-24">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase">Recent Outputs</h2>
            <span className="font-mono text-xs text-muted-foreground">V.03/26</span>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-border border border-border">
            <div className="bg-background p-4">
              <img src={nimbusImg} alt="Nimbus Agents — agent orchestration platform marketing site" width={1280} height={960} loading="lazy" className="w-full aspect-[4/3] object-cover bg-card" />
              <div className="mt-4 flex justify-between items-center">
                <span className="font-bold uppercase tracking-tighter">Nimbus Agents — Orchestration Platform</span>
                <span className="text-[10px] font-mono text-muted-foreground">DEVTOOL HUB // 48H</span>
              </div>
            </div>
            <div className="bg-background p-4">
              <img src={vectorImg} alt="Vector Eval — LLM evaluation platform marketing site" width={1280} height={960} loading="lazy" className="w-full aspect-[4/3] object-cover bg-card" />
              <div className="mt-4 flex justify-between items-center">
                <span className="font-bold uppercase tracking-tighter">Vector Eval — LLM Eval Suite</span>
                <span className="text-[10px] font-mono text-muted-foreground">MARKETING SITE // 48H</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
