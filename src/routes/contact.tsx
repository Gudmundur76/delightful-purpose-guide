import { createFileRoute, Link } from "@tanstack/react-router";
import { SmartContactForm } from "@/components/SmartContactForm";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Start a brief — Grow" },
      { name: "description", content: "Tell us about your project in five short steps. We reply within one business hour with a kickoff time." },
      { property: "og:title", content: "Start a brief — Grow" },
      { property: "og:description", content: "Five-step intake, ~90 seconds. One-hour reply, kickoff within 48 hours." },
      { property: "og:url", content: "https://grow.contact/contact" },
      ...ogImageMeta({
        title: "Start a brief — Grow",
        kicker: "Grow",
        sub: "Five short steps. One-hour reply. Kickoff within 48 hours.",
      }),
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
                Let's build<br />something<br />worth citing.
              </h1>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-6">
                Next available slot: today, 14:00 UTC
              </p>
              <p className="text-muted-foreground mt-6 max-w-md">
                Five short steps, about 90 seconds. We read every brief personally and reply within one business hour with a kickoff time and a few clarifying questions.
              </p>
              <p className="text-sm mt-6">
                Want to look around first? <Link to="/faq" className="underline hover:text-accent">Read the FAQ →</Link>
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
