import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, H2, P, UL } from "@/components/LegalPage";
import { COMPANY } from "@/lib/legal/company";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Grow" },
      { name: "description", content: "Terms governing use of Grow Studio's website and build services." },
      { property: "og:title", content: "Terms of Service — Grow" },
      { property: "og:description", content: "Terms governing use of Grow Studio's website and build services." },
      { property: "og:url", content: "https://grow.contact/terms" },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      updated={COMPANY.lastUpdated}
      intro={`By using ${COMPANY.website} or purchasing a build, you agree to these terms with ${COMPANY.legalEntity}.`}
    >
      <section>
        <H2>1. The service</H2>
        <P>
          We design and build agent-native marketing websites on fixed-price tiers ("Starter — 48h" and
          "Growth — 5-day"). Scope, deliverables and timelines are described on the Pricing page and confirmed
          by email after payment.
        </P>
      </section>

      <section>
        <H2>2. Orders & payment</H2>
        <UL>
          <li>Prices are in USD and exclusive of any applicable taxes unless stated.</li>
          <li>Payment is taken upfront via PayPal Advanced Checkout. The build window starts on successful capture.</li>
          <li>You confirm you are authorised to use the payment method and the billing details are accurate.</li>
        </UL>
      </section>

      <section>
        <H2>3. Your responsibilities</H2>
        <UL>
          <li>Provide brand assets, copy and feedback within the agreed turnaround windows.</li>
          <li>Hold rights/licences to all content you supply.</li>
          <li>Not use the service for unlawful, infringing or fraudulent purposes.</li>
        </UL>
      </section>

      <section>
        <H2>4. Intellectual property</H2>
        <P>
          On full payment, you receive ownership of the final code and design deliverables produced specifically for you.
          We retain rights to background tools, libraries, templates, and the right to showcase the work in our portfolio
          unless you opt out in writing.
        </P>
      </section>

      <section>
        <H2>5. Refunds & cancellations</H2>
        <P>
          grow.contact is a free, open-source service — nothing is sold and no payment is taken, so there is nothing to refund.
          You can stop using the tools, delete your account, and remove any embed at any time with no obligation.
        </P>
      </section>


      <section>
        <H2>6. Warranty</H2>
        <P>
          We deliver the service with reasonable care and skill. We do not warrant the service will be uninterrupted or
          error-free. Third-party platforms (PayPal, Cloudflare, Supabase) are governed by their own terms.
        </P>
      </section>

      <section>
        <H2>7. Liability</H2>
        <P>
          To the maximum extent permitted by law, our total liability under or in connection with the service is limited
          to the fees you paid in the 12 months preceding the claim. We exclude liability for indirect, consequential,
          or lost profit/data damages. Nothing limits liability that cannot be limited by law (e.g. fraud, death or
          personal injury caused by negligence).
        </P>
      </section>

      <section>
        <H2>8. Indemnity</H2>
        <P>
          You agree to indemnify us against claims arising from content you supply or from your unlawful use of the service.
        </P>
      </section>

      <section>
        <H2>9. Termination</H2>
        <P>
          We may suspend or terminate access for material breach of these terms, with refund only as set out in the Refund Policy.
        </P>
      </section>

      <section>
        <H2>10. Law & disputes</H2>
        <P>
          These terms are governed by the laws of {COMPANY.legalEntity}'s registered jurisdiction. Mandatory consumer
          rights in your country of residence are unaffected. Disputes are subject to the non-exclusive jurisdiction of
          the courts there; EU consumers may also use the{" "}
          <a className="underline" href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
            EU ODR platform
          </a>.
        </P>
      </section>

      <section>
        <H2>11. Contact</H2>
        <P>
          {COMPANY.legalEntity} — {COMPANY.address} — <span className="underline select-all">{COMPANY.contactEmail}</span>.
        </P>
      </section>
    </LegalPage>
  );
}
