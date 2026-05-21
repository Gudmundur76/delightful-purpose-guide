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
  score?: number;
  reasoning?: string;
  suggestedTier?: string;
}

const HotLeadNotification = ({
  name,
  email,
  budgetTier,
  message,
  score,
  reasoning,
  suggestedTier,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>🔥 Hot lead — {name ?? email ?? "new"} (score {score ?? "—"})</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={mono}>// HOT_LEAD · SCORE {score ?? "—"}/100</Text>
        <Heading style={h1}>{name ?? "Hot lead"}</Heading>
        <Text style={text}>{email}</Text>

        <Section style={card}>
          <Text style={cardLabel}>// AI reasoning</Text>
          <Text style={cardValue}>{reasoning ?? "—"}</Text>
        </Section>

        <Section style={card}>
          <Text style={cardLabel}>// Suggested tier</Text>
          <Text style={cardValue}>{suggestedTier ?? "—"}</Text>
        </Section>

        <Section style={card}>
          <Text style={cardLabel}>// Self-reported budget</Text>
          <Text style={cardValue}>{budgetTier ?? "—"}</Text>
        </Section>

        <Section style={card}>
          <Text style={cardLabel}>// Their message</Text>
          <Text style={brief}>{message ?? ""}</Text>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>
          Auto-reply has already been sent. Follow up personally within the hour.
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: HotLeadNotification,
  subject: (d) => `🔥 Hot lead — ${(d?.name as string) ?? (d?.email as string) ?? "new"} (${(d?.score as number) ?? "?"})`,
  displayName: "Hot lead notification (internal)",
  previewData: {
    name: "Jane Doe",
    email: "jane@nimbus.ai",
    budgetTier: "tier_03",
    message: "We just closed our Series A and need to relaunch nimbus.ai in 3 weeks.",
    score: 92,
    reasoning: "Funded AI startup, clear deadline, named tier, technical founder.",
    suggestedTier: "growth",
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
  letterSpacing: "0.15em",
  color: "#ff5722",
  textTransform: "uppercase" as const,
  margin: "0 0 16px",
};
const h1 = {
  fontSize: "30px",
  fontWeight: 800,
  letterSpacing: "-0.03em",
  color: "#0a0a0a",
  lineHeight: 1.1,
  margin: "0 0 6px",
};
const text = {
  fontSize: "14px",
  color: "#71717a",
  margin: "0 0 28px",
};
const card = {
  border: "1px solid #e4e4e7",
  padding: "14px 16px",
  margin: "0 0 10px",
};
const cardLabel = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "10px",
  letterSpacing: "0.2em",
  color: "#71717a",
  textTransform: "uppercase" as const,
  margin: "0 0 6px",
};
const cardValue = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#0a0a0a",
  margin: 0,
  lineHeight: 1.5,
};
const brief = {
  fontSize: "13px",
  color: "#3f3f46",
  lineHeight: 1.6,
  margin: 0,
  whiteSpace: "pre-wrap" as const,
};
const hr = { borderColor: "#e4e4e7", margin: "28px 0 16px" };
const footer = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "11px",
  color: "#71717a",
  lineHeight: 1.6,
  margin: 0,
};
