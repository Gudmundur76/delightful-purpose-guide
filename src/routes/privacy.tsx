import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, H2, P, UL } from "@/components/LegalPage";
import { COMPANY } from "@/lib/legal/company";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Grow" },
      { name: "description", content: "How Grow Studio collects, uses and protects personal data. GDPR, UK GDPR and CCPA compliant." },
      { property: "og:title", content: "Privacy Policy — Grow" },
      { property: "og:description", content: "How Grow Studio collects, uses and protects personal data." },
      { property: "og:url", content: "https://grow.contact/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated={COMPANY.lastUpdated}
      intro={`${COMPANY.legalEntity} ("we", "us") respects your privacy. ${COMPANY.jurisdictionNote}`}
    >
      <section>
        <H2>1. Who we are</H2>
        <P>
          Data controller: {COMPANY.legalEntity}, {COMPANY.address}. Registration: {COMPANY.registration}.
          Contact: <span className="underline select-all">{COMPANY.privacyEmail}</span>.
        </P>
      </section>

      <section>
        <H2>2. What we collect</H2>
        <UL>
          <li><strong>Lead / contact data</strong> — name, email, budget tier, message you send via our forms.</li>
          <li><strong>Payment data</strong> — order ID, amount, tier, customer name and email (card data is handled by PayPal; we never see or store it).</li>
          <li><strong>Project data</strong> — information you share to scope and deliver a build.</li>
          <li><strong>Technical data</strong> — IP address, browser/device info, pages viewed, performance metrics.</li>
          <li><strong>Cookies</strong> — see our <a className="underline" href="/cookies">Cookie Policy</a>.</li>
        </UL>
      </section>

      <section>
        <H2>3. Why we process it (legal bases — GDPR)</H2>
        <UL>
          <li><strong>Contract</strong> — to respond to enquiries, deliver paid work, send receipts and project updates.</li>
          <li><strong>Legitimate interests</strong> — site security, fraud prevention, basic analytics, improving our service.</li>
          <li><strong>Consent</strong> — non-essential cookies, marketing emails (where applicable). You can withdraw at any time.</li>
          <li><strong>Legal obligation</strong> — tax, accounting, anti-fraud and record-keeping.</li>
        </UL>
      </section>

      <section>
        <H2>4. Who we share it with</H2>
        <UL>
          <li><strong>PayPal</strong> — payment processing (PCI-DSS certified).</li>
          <li><strong>Cloudflare</strong> — hosting, DNS, edge delivery.</li>
          <li><strong>Supabase</strong> — encrypted database and storage.</li>
          <li><strong>Email delivery providers</strong> — to send transactional email from <code>notify.grow.contact</code>.</li>
          <li>Tax, legal and accounting advisors where required by law.</li>
        </UL>
        <P>We do not sell your personal information.</P>
      </section>

      <section>
        <H2>5. International transfers</H2>
        <P>
          Some processors are located outside the EU/UK. Where personal data is transferred, we rely on adequacy decisions
          or Standard Contractual Clauses (SCCs) and equivalent UK safeguards.
        </P>
      </section>

      <section>
        <H2>6. How long we keep it</H2>
        <UL>
          <li>Lead messages: up to 24 months from last contact.</li>
          <li>Payment & invoice records: as required by tax law (typically 6–10 years).</li>
          <li>Project files: 24 months after final delivery, then archived or deleted on request.</li>
          <li>Email logs: 12 months for deliverability and abuse monitoring.</li>
        </UL>
      </section>

      <section>
        <H2>7. Your rights</H2>
        <P>
          <strong>EU / UK (GDPR):</strong> access, rectification, erasure, restriction, portability, objection, and the
          right to lodge a complaint with your local supervisory authority (e.g. the ICO in the UK, your national DPA in the EU).
        </P>
        <P>
          <strong>California (CCPA/CPRA):</strong> right to know, delete, correct, opt out of "sale" or "sharing" (we do
          neither), and the right to limit use of sensitive personal information. We do not discriminate against you for
          exercising these rights.
        </P>
        <P>
          To exercise any right, email{" "}
          <span className="underline select-all">{COMPANY.privacyEmail}</span>. We respond within 30 days.
        </P>
      </section>

      <section>
        <H2>8. Security</H2>
        <P>
          We use TLS in transit, encryption at rest, Row Level Security on our database, scoped service tokens, and
          regular dependency and security scans. No system is perfectly secure — please report concerns to{" "}
          <span className="underline select-all">{COMPANY.privacyEmail}</span>.
        </P>
      </section>

      <section>
        <H2>9. Children</H2>
        <P>Our services are not directed to children under 16. We do not knowingly collect their data.</P>
      </section>

      <section>
        <H2>10. Changes</H2>
        <P>
          We will post changes to this policy on this page and update the "last updated" date. Material changes will be
          notified by email where we hold an address for you.
        </P>
      </section>
    </LegalPage>
  );
}
