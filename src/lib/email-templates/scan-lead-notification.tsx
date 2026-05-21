import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Hr,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  email?: string;
  url?: string;
  score?: number;
}

const ScanLeadNotificationEmail = ({ email, url, score }: Props) => {
  const s = typeof score === "number" ? score : 0;
  const heat = s < 60 ? "🔥 HOT" : s < 80 ? "WARM" : "COLD";
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        {heat} scan lead: {email} — score {s}/100
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={mono}>// SCAN LEAD // {heat} //</Text>
          <Heading style={h1}>Score {s}/100</Heading>

          <Section style={row}>
            <Text style={label}>// Prospect Email</Text>
            <Text style={value}>{email ?? "—"}</Text>
          </Section>
          <Section style={row}>
            <Text style={label}>// Scanned URL</Text>
            <Text style={value}>{url ?? "—"}</Text>
          </Section>
          <Section style={row}>
            <Text style={label}>// Agent Readability</Text>
            <Text style={value}>
              {s}/100 — {s < 60 ? "significant gaps, prime target" : s < 80 ? "decent, quick-win opportunity" : "already strong"}
            </Text>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            They asked for the full PDF report. Reach out within 24h while it's top of mind.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: ScanLeadNotificationEmail,
  subject: (data: Record<string, any>) => {
    const s = typeof data.score === "number" ? data.score : 0;
    const heat = s < 60 ? "🔥 HOT" : s < 80 ? "WARM" : "COLD";
    return `${heat} scan lead — ${data.email ?? "unknown"} (${s}/100)`;
  },
  displayName: "Scan lead notification (internal)",
  to: "hello@grow.contact",
  previewData: {
    email: "jordan@acme.ai",
    url: "https://acme.ai",
    score: 54,
  },
} satisfies TemplateEntry;

const main = {
  backgroundColor: "#ffffff",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  margin: 0,
  padding: 0,
};
const container = { padding: "40px 28px", maxWidth: "560px" };
const mono = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "11px",
  letterSpacing: "0.2em",
  color: "#ff5722",
  textTransform: "uppercase" as const,
  margin: "0 0 16px",
};
const h1 = {
  fontSize: "28px",
  fontWeight: 800,
  letterSpacing: "-0.04em",
  color: "#0a0a0a",
  margin: "0 0 28px",
};
const row = { borderTop: "1px solid #e4e4e7", padding: "14px 0" };
const label = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "10px",
  letterSpacing: "0.2em",
  color: "#71717a",
  textTransform: "uppercase" as const,
  margin: "0 0 4px",
};
const value = {
  fontSize: "15px",
  fontWeight: 600,
  color: "#0a0a0a",
  margin: 0,
  wordBreak: "break-all" as const,
};
const hr = { borderColor: "#e4e4e7", margin: "28px 0 16px" };
const footer = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "11px",
  color: "#71717a",
  margin: 0,
};
