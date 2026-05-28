import { createFileRoute, Link } from "@tanstack/react-router";
import { SmartContactForm } from "@/components/SmartContactForm";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Start a Brief — Grow" },
      { name: "description", content: "Tell us about your project. Smart intake in five quick steps." },
      { property: "og:title", content: "Start a Brief — Grow" },
      { property: "og:description", content: "Five-step smart brief — kickoff in 48 hours." },
      { property: "og:url", content: "https://grow.contact/contact" },
      { property: "og:image", content: "https://grow.contact/api/public/widget/og.svg?kicker=Grow&title=Start%20a%20Brief%20%E2%80%94%20Grow&sub=Tell%20us%20about%20your%20project.%20Smart%20intake%20in%20five%20quick%20steps." },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Start a Brief — Grow" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://grow.contact/api/public/widget/og.svg?kicker=Grow&title=Start%20a%20Brief%20%E2%80%94%20Grow&sub=Tell%20us%20about%20your%20project.%20Smart%20intake%20in%20five%20quick%20steps." },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/contact" }],
  }),
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 md:gap-16 items-start">
            <div>
              <p className="font-mono text-accent text-xs mb-4 uppercase tracking-[0.2em]">// Intake</p>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter uppercase leading-none">
                Ready to<br />ship your<br />vision?
              </h1>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-6">
                Next available slot: Today, 14:00 UTC
              </p>
              <p className="text-muted-foreground mt-6 max-w-md">
                Five-step brief. Takes about 90 seconds. We reply within one business hour with a kickoff time.
              </p>
              <p className="text-sm mt-6">
                Got questions first? <Link to="/faq" className="underline hover:text-accent">Read the FAQ →</Link>
              </p>
            </div>
            <div className="bg-accent p-6 sm:p-8 md:p-10">
              <SmartContactForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
