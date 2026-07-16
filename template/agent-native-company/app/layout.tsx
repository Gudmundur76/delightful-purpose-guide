import type { ReactNode } from "react";
import { loadPage, extractFaq, extractPricing } from "@/lib/content";
import { organizationSchema, softwareApplicationSchema, faqPageSchema } from "@/lib/schema";
import "./globals.css";

export const dynamic = "force-static";

export async function generateMetadata() {
  const { frontmatter } = loadPage("index");
  return {
    title: `${frontmatter.name} — ${frontmatter.description.slice(0, 60)}`,
    description: frontmatter.description,
    openGraph: {
      title: frontmatter.name,
      description: frontmatter.description,
      url: `https://${frontmatter.domain}`,
      type: "website",
    },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const page = loadPage("index");
  const f = page.frontmatter;
  const url = `https://${f.domain}/`;

  const schemas = [
    organizationSchema(f),
    softwareApplicationSchema(f, extractPricing(page.sections["Pricing"])),
    faqPageSchema(url, extractFaq(page.sections["FAQ"])),
  ].filter(Boolean);

  return (
    <html lang="en">
      <head>
        <link rel="canonical" href={url} />
        <meta name="generator" content="citation.is/agent-native-template@2026.05" />
        {schemas.map((s, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
          />
        ))}
      </head>
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
