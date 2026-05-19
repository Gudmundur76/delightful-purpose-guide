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

const SITE_NAME = "Grow";

interface Props {
  name?: string;
  budgetTier?: string;
  message?: string;
}

const TIER_LABEL: Record<string, string> = {
  tier_01: "Tier 01 — One-Pager",
  tier_02: "Tier 02 — Full Site",
  tier_03: "Tier 03 — Web App",
};

const LeadConfirmationEmail = ({ name, budgetTier, message }: Props) => {
  const tier = budgetTier ? TIER_LABEL[budgetTier] ?? budgetTier : null;
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Brief received — {SITE_NAME} engineers are reviewing.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={mono}>// {SITE_NAME}_</Text>
          <Heading style={h1}>
            {name ? `${name},` : "Brief received."}
            <br />
            we have your brief.
          </Heading>
          <Text style={text}>
            Our engineers are reviewing your project now. Expect a reply within
            <strong> 4 hours</strong> from a real human — not a sequence.
          </Text>

          <Section style={card}>
            <Text style={cardLabel}>// Status</Text>
            <Text style={cardValue}>Queued for review</Text>
          </Section>

          {tier ? (
            <Section style={card}>
              <Text style={cardLabel}>// Budget Tier</Text>
              <Text style={cardValue}>{tier}</Text>
            </Section>
          ) : null}

          {message ? (
            <Section style={card}>
              <Text style={cardLabel}>// Your Brief</Text>
              <Text style={brief}>{message}</Text>
            </Section>
          ) : null}

          <Hr style={hr} />
          <Text style={footer}>
            48H delivery window starts the moment we confirm scope.<br />
            — The {SITE_NAME} Studio
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: LeadConfirmationEmail,
  subject: "Brief received — Grow is on it",
  displayName: "Lead confirmation",
  previewData: {
    name: "Jane",
    budgetTier: "tier_02",
    message: "Marketing site for our SaaS, 5 pages, launch in 2 weeks.",
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
  margin: "0 0 24px",
};
const h1 = {
  fontSize: "32px",
  fontWeight: 800,
  letterSpacing: "-0.04em",
  color: "#0a0a0a",
  lineHeight: 1.05,
  margin: "0 0 24px",
  textTransform: "uppercase" as const,
};
const text = {
  fontSize: "15px",
  color: "#3f3f46",
  lineHeight: 1.6,
  margin: "0 0 28px",
};
const card = {
  border: "1px solid #e4e4e7",
  padding: "16px 18px",
  margin: "0 0 12px",
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
  fontSize: "15px",
  fontWeight: 700,
  color: "#0a0a0a",
  margin: 0,
  letterSpacing: "-0.02em",
};
const brief = {
  fontSize: "14px",
  color: "#3f3f46",
  lineHeight: 1.6,
  margin: 0,
  whiteSpace: "pre-wrap" as const,
};
const hr = { borderColor: "#e4e4e7", margin: "32px 0 20px" };
const footer = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "11px",
  color: "#71717a",
  lineHeight: 1.6,
  margin: 0,
};
