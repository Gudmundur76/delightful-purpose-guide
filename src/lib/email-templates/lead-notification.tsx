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
  name?: string;
  email?: string;
  budgetTier?: string;
  message?: string;
  company?: string;
}

const TIER_LABEL: Record<string, string> = {
  tier_01: "Tier 01 — One-Pager ($2,400)",
  tier_02: "Tier 02 — Full Site ($4,800)",
  tier_03: "Tier 03 — Web App ($8,500+)",
};

const LeadNotificationEmail = ({ name, email, budgetTier, message, company }: Props) => {
  const tier = budgetTier ? TIER_LABEL[budgetTier] ?? budgetTier : "—";
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        New lead: {name ?? "Unknown"} — {tier}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={mono}>// NEW LEAD // GROW_</Text>
          <Heading style={h1}>{name ?? "New lead"}</Heading>

          <Section style={row}>
            <Text style={label}>// Email</Text>
            <Text style={value}>{email ?? "—"}</Text>
          </Section>
          <Section style={row}>
            <Text style={label}>// Budget Tier</Text>
            <Text style={value}>{tier}</Text>
          </Section>
          <Section style={row}>
            <Text style={label}>// Project Brief</Text>
            <Text style={brief}>{message ?? "—"}</Text>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            Reply within 4 hours to maintain the SLA.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: LeadNotificationEmail,
  subject: (data: Record<string, any>) =>
    `New lead — ${data.name ?? "unknown"} (${data.budgetTier ?? "no tier"})`,
  displayName: "Internal lead notification",
  to: "hello@grow.contact",
  previewData: {
    name: "Jane Doe",
    email: "jane@example.com",
    budgetTier: "tier_02",
    message: "Need a 5-page marketing site for our SaaS launch.",
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
  textTransform: "uppercase" as const,
};
const row = {
  borderTop: "1px solid #e4e4e7",
  padding: "14px 0",
};
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
};
const brief = {
  fontSize: "14px",
  color: "#27272a",
  lineHeight: 1.6,
  margin: 0,
  whiteSpace: "pre-wrap" as const,
};
const hr = { borderColor: "#e4e4e7", margin: "28px 0 16px" };
const footer = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "11px",
  color: "#71717a",
  margin: 0,
};
