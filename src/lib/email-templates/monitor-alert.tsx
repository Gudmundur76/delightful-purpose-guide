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
  previousScore?: number;
  newScore?: number;
  delta?: number;
}

const MonitorAlertEmail = ({ url, previousScore, newScore, delta }: Props) => {
  const reportHref = `${BASE}/check/report?u=${encodeURIComponent(url ?? "")}&s=${newScore ?? ""}`;
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Score drop detected on {url}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={mono}>// {SITE_NAME}_ / monitor</Text>
          <Heading style={h1}>
            Score drop
            <br />
            detected.
          </Heading>
          <Text style={text}>
            Your monitored site <strong>{url}</strong> dropped{" "}
            <strong>{delta ?? "—"} points</strong> on the latest scan.
          </Text>

          <Section style={card}>
            <Text style={cardLabel}>// Previous → New</Text>
            <Text style={cardValue}>
              {previousScore ?? "—"} → {newScore ?? "—"} / 100
            </Text>
          </Section>

          <Section style={{ margin: "24px 0" }}>
            <Button href={reportHref} style={button}>
              Open the report →
            </Button>
          </Section>

          <Text style={text}>
            Investigate the failing signals, ship fixes, and the next scheduled
            scan will confirm the recovery.
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            You're receiving this because alerts are enabled for this site.
            Manage at {BASE}/app.
            <br />— {SITE_NAME} Monitoring
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: MonitorAlertEmail,
  subject: (data: Record<string, any>) =>
    `[Grow] ${data.url ?? "Site"} dropped to ${data.newScore ?? "?"} /100`,
  displayName: "Monitor score-drop alert",
  previewData: {
    url: "https://example.com",
    previousScore: 88,
    newScore: 72,
    delta: 16,
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
