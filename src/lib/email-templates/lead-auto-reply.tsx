import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Hr,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

const SITE_NAME = "Grow";

interface Props {
  name?: string;
  subject?: string;
  body?: string;
}

const LeadAutoReplyEmail = ({ name, subject, body }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{subject ?? "A note from Grow"}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={mono}>// {SITE_NAME}_</Text>
        <Heading style={h1}>{subject ?? `Hi ${name ?? "there"}`}</Heading>
        <Text style={bodyText}>{body ?? ""}</Text>
        <Hr style={hr} />
        <Text style={footer}>
          Sent automatically the moment your message landed.<br />
          A human is also reading — reply any time.
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: LeadAutoReplyEmail,
  subject: (d) => (d?.subject as string) ?? "A note from Grow",
  displayName: "Lead auto-reply (AI)",
  previewData: {
    name: "Jane",
    subject: "Re: launching Nimbus Agents",
    body: "Hey Jane — saw you're shipping an orchestration layer for AI agents in two weeks. That's exactly the sweet spot for our Growth tier (5 days, agent-native markup, JSON-LD on every page).\n\nIf you want to walk through scope, grab 20 min here: https://calendly.com/grow-contact/intro\n\n— Grow Studio",
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
  fontSize: "26px",
  fontWeight: 800,
  letterSpacing: "-0.03em",
  color: "#0a0a0a",
  lineHeight: 1.15,
  margin: "0 0 24px",
};
const bodyText = {
  fontSize: "15px",
  color: "#3f3f46",
  lineHeight: 1.65,
  margin: "0 0 28px",
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
