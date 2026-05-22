import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ClipboardList,
  GitBranch,
  Layout,
  Type,
  Rocket,
} from "lucide-react";

const STEPS = [
  {
    n: "01",
    t: "Brief",
    d: "Send your positioning, docs, and API surface. We extract intent and constraints into a tight creative brief — this is where we lock the single primary action per page, so every later step compounds toward one measurable outcome.",
    badge: "2h",
    icon: ClipboardList,
  },
  {
    n: "02",
    t: "Structure",
    d: "Turn the brief into a semantic site map, content schema, and JSON-LD taxonomy. JSON-LD is the machine-readable layer that tells ChatGPT, Perplexity, and Google AI Overviews exactly what you sell, who you are, and how your pages relate — so bots cite your page instead of guessing or skipping it.",
    badge: "4h",
    icon: GitBranch,
  },
  {
    n: "03",
    t: "Design",
    d: "High-fidelity UI built directly in code — every component is real, not a Figma mock. Skipping the design-to-dev handoff is how we cut a week off the timeline without cutting fidelity.",
    badge: "16h",
    icon: Layout,
  },
  {
    n: "04",
    t: "Content",
    d: "llms.txt, OpenGraph, semantic HTML5 landmarks, sitemap and RSS. llms.txt is a curated markdown summary at /llms.txt that AI agents read first; semantic markup means bots find your headline, pricing, and CTAs in under 10ms instead of parsing div soup. Together they make every page ingestion-ready.",
    badge: "18h",
    icon: Type,
  },
  {
    n: "05",
    t: "Launch",
    d: "Lighthouse audit, agent-readability check at /check, domain handover. We verify the site loads under the 1–5 second timeout AI crawlers enforce, then ship. Live and citeable in 48 hours.",
    badge: "8h",
    icon: Rocket,
  },
];

export function ProcessTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate through steps sequentially when section is visible
            let current = 0;
            const interval = setInterval(() => {
              current++;
              if (current >= STEPS.length) {
                clearInterval(interval);
              } else {
                setActiveIndex(current);
              }
            }, 600);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="scroll-mt-20 border-b border-border bg-card/50"
    >
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="font-mono text-accent text-xs mb-4 uppercase tracking-[0.2em]">
            // How We Work
          </p>
          <h2 className="text-4xl font-extrabold tracking-tighter uppercase">
            The Process
          </h2>
          <p className="text-muted-foreground text-sm mt-4 max-w-lg mx-auto">
            From brief to live site in 48 hours. Every step engineered for speed
            and agent readability.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting line — full height background */}
          <div className="absolute left-[19px] md:left-[27px] top-0 bottom-0 w-px bg-border" />

          {/* Animated cyan progress line */}
          <div
            className="absolute left-[19px] md:left-[27px] top-0 w-px bg-accent transition-all duration-1000 ease-out"
            style={{
              height: `${(activeIndex / (STEPS.length - 1)) * 100}%`,
            }}
          />

          {/* Animated progress dot on the line */}
          <div
            className="absolute left-[14px] md:left-[22px] w-[11px] h-[11px] rounded-full bg-accent shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-700 ease-out z-10"
            style={{
              top: `calc(${(activeIndex / (STEPS.length - 1)) * 100}% - 5.5px)`,
            }}
          />

          {/* Steps */}
          <div className="space-y-12">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i <= activeIndex;
              return (
                <div
                  key={step.n}
                  className={`relative pl-14 md:pl-20 transition-all duration-500 ${
                    isActive
                      ? "opacity-100 translate-x-0"
                      : "opacity-40 translate-x-2"
                  }`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  {/* Step node */}
                  <div
                    className={`absolute left-0 md:left-2 top-0 w-10 h-10 md:w-12 md:h-12 rounded-full border flex items-center justify-center transition-all duration-500 ${
                      isActive
                        ? "border-accent bg-accent/10 shadow-[0_0_12px_rgba(34,211,238,0.15)]"
                        : "border-border bg-card"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={`transition-colors duration-500 ${
                        isActive ? "text-accent" : "text-muted-foreground"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="pt-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold uppercase tracking-tighter">
                        {step.t}
                      </h3>
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded-sm border transition-all duration-500 ${
                          isActive
                            ? "border-accent/40 bg-accent/10 text-accent"
                            : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        {step.badge}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-2 leading-relaxed max-w-lg">
                      {step.d}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total time badge + CTA */}
        <div className="mt-16 flex flex-col items-center gap-6">
          <span className="inline-flex items-center gap-2 font-mono text-xs border border-accent/40 bg-accent/10 text-accent px-4 py-2 rounded-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Total: 48 hours — fixed price, no scope creep
          </span>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-3 bg-accent text-accent-foreground font-bold px-6 py-4 uppercase tracking-tighter text-sm hover:bg-foreground hover:text-background transition-colors"
          >
            Start the 48-Hour Clock
            <span className="font-mono text-[10px] opacity-70 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
