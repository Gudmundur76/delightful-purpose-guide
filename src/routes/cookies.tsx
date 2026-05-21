import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, H2, P, UL } from "@/components/LegalPage";
import { COMPANY } from "@/lib/legal/company";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — Grow" },
      { name: "description", content: "How Grow Studio uses cookies and similar technologies." },
      { property: "og:title", content: "Cookie Policy — Grow" },
      { property: "og:description", content: "How Grow Studio uses cookies and similar technologies." },
      { property: "og:url", content: "https://grow.contact/cookies" },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/cookies" }],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Cookie Policy"
      updated={COMPANY.lastUpdated}
      intro="We keep cookies to the minimum needed to run the site, and we don't load tracking or marketing cookies until you opt in."
    >
      <section>
        <H2>1. What are cookies?</H2>
        <P>
          Cookies are small files placed on your device. We also use similar technologies (localStorage, sessionStorage)
          for the same purposes.
        </P>
      </section>

      <section>
        <H2>2. Categories we use</H2>
        <UL>
          <li>
            <strong>Strictly necessary</strong> — authentication session, CSRF protection, payment session, cookie-consent
            choice. Always on; the site won't work without them.
          </li>
          <li>
            <strong>Functional</strong> — remembering your UI preferences (e.g. dismissed banners). Set only after consent.
          </li>
          <li>
            <strong>Analytics</strong> — aggregate, privacy-friendly metrics about how the site is used. Set only after consent.
          </li>
          <li>
            <strong>Marketing</strong> — not currently used. If we add them, they will only load with consent.
          </li>
        </UL>
      </section>

      <section>
        <H2>3. Third parties</H2>
        <UL>
          <li><strong>PayPal</strong> sets cookies when you open the checkout to process payment and prevent fraud.</li>
          <li><strong>Cloudflare</strong> may set a security cookie to protect the site from abuse.</li>
        </UL>
      </section>

      <section>
        <H2>4. Managing your choices</H2>
        <P>
          You can change or withdraw consent at any time using the "Cookie settings" link in the footer, or by clearing
          cookies in your browser. Most browsers also let you block all cookies; doing so may break parts of the site.
        </P>
      </section>

      <section>
        <H2>5. Contact</H2>
        <P>
          Questions: <a className="underline" href={`mailto:${COMPANY.privacyEmail}`}>{COMPANY.privacyEmail}</a>.
        </P>
      </section>
    </LegalPage>
  );
}
