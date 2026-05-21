import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, H2, P, UL } from "@/components/LegalPage";
import { COMPANY } from "@/lib/legal/company";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund Policy — Grow" },
      { name: "description", content: "How refunds work on Grow Studio's fixed-price builds." },
      { property: "og:title", content: "Refund Policy — Grow" },
      { property: "og:description", content: "How refunds work on Grow Studio's fixed-price builds." },
      { property: "og:url", content: "https://grow.contact/refund" },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/refund" }],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Refund Policy"
      updated={COMPANY.lastUpdated}
      intro="We sell custom services on tight timelines. This is how refunds work — written in plain English."
    >
      <section>
        <H2>1. Before we start</H2>
        <P>
          If you cancel before we begin the build (and within 14 days of purchase if you're an EU/UK consumer), you get a
          full refund minus any non-recoverable payment processing fees.
        </P>
      </section>

      <section>
        <H2>2. After the build has started</H2>
        <UL>
          <li>The 48-hour Starter and 5-day Growth builds begin the moment payment is captured.</li>
          <li>By asking us to start immediately, EU/UK consumers acknowledge they may lose the statutory withdrawal right once delivery begins.</li>
          <li>If you cancel mid-build, we refund the unworked portion at our reasonable discretion, typically 25–75% depending on stage.</li>
        </UL>
      </section>

      <section>
        <H2>3. If we miss the deadline</H2>
        <P>
          If we miss the delivery window without a written extension agreed with you, you can request a 25% refund of the
          tier price as a goodwill credit, or wait for completion at no extra cost. Force-majeure events (your delays in
          providing assets, third-party outages) extend the window automatically.
        </P>
      </section>

      <section>
        <H2>4. Quality guarantee</H2>
        <P>
          If the final deliverable materially fails to match the agreed scope, we fix it free of charge. If we can't fix
          it within a reasonable time, you may request a full refund.
        </P>
      </section>

      <section>
        <H2>5. How to request a refund</H2>
        <P>
          Email <a className="underline" href={`mailto:${COMPANY.contactEmail}`}>{COMPANY.contactEmail}</a> with your
          order ID and a short explanation. We respond within 5 business days and process approved refunds within 10
          business days via the original payment method (PayPal).
        </P>
      </section>

      <section>
        <H2>6. Chargebacks</H2>
        <P>
          Please contact us first — most issues are resolved within a day. Initiating a chargeback without contacting us
          may delay any refund and we reserve the right to dispute it.
        </P>
      </section>
    </LegalPage>
  );
}
