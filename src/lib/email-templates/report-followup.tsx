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
  Button,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

const SITE_NAME = "Grow";
const BASE = "https://grow.contact";

interface Props {
  url?: string;
  score?: number;
}

const ReportFollowupEmail = ({ url, score }: Props) => {
  const tier =
    typeof score === "number"
      ? score >= 85
        ? "Agent-native"
        : score >= 70
          ? "Readable, with quick wins"
          : "Significant gaps"
      : "Scanned";
  const reportHref = `${BASE}/check/report?u=${encodeURIComponent(url ?? "")}&s=${score ?? ""}`;
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your Agent Readability Report is ready.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={mono}>// {SITE_NAME}_</Text>
          <Heading style={h1}>
            Your report
            <br />
            is ready.
          </Heading>
          <Text style={text}>
            We scanned <strong>{url || "your site"}</strong> across five
            agent-readability signals — semantic HTML, JSON-LD, llms.txt,
            citability, and first-contentful speed.
          </Text>

          <Section style={card}>
            <Text style={cardLabel}>// Score</Text>
            <Text style={cardValue}>
              {typeof score === "number" ? `${score} / 100` : "—"} · {tier}
            </Text>
          </Section>

          <Section style={{ margin: "24px 0" }}>
            <Button href={reportHref} style={button}>
              Open the report →
            </Button>
          </Section>

          <Text style={text}>
            Want us to ship the fixes? A 48-hour Starter build resolves every
            failing signal and comes with a re-score guarantee. Hit reply and
            we'll send a fixed-price quote.
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            One follow-up email max. Unsubscribe at the bottom of this message.
            <br />— The {SITE_NAME} Studio
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: ReportFollowupEmail,
  subject: (data: Record<string, any>) =>
    typeof data.score === "number"
      ? `Your Agent Readability Score: ${data.score}/100`
      : "Your Agent Readability Report",
  displayName: "Report follow-up",
  previewData: {
    url: "https://example.com",
    score: 72,
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
  margin: "0 0 20px",
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
const button = {
  backgroundColor: "#0a0a0a",
  color: "#ffffff",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "13px",
  fontWeight: 700,
  padding: "14px 22px",
  textDecoration: "none",
  display: "inline-block",
};
const hr = { borderColor: "#e4e4e7", margin: "32px 0 20px" };
const footer = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "11px",
  color: "#71717a",
  lineHeight: 1.6,
  margin: 0,
};
