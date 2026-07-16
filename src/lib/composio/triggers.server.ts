// Fire-and-forget event triggers. Never throws — always swallows errors so a
// Composio failure cannot break the originating request.
import { executeTool, getActiveConnection, listActiveConnectionsForToolkit } from "./composio.server";

// NOTE: Composio tool slugs vary by toolkit. These are the canonical names at
// time of writing. If a call fails with "tool not found", adjust the slug
// to match your Composio dashboard (Tools tab) for the connected toolkit.
const TOOL_SLUGS = {
  gmail_send: "GMAIL_SEND_EMAIL",
  slack_send: "SLACK_SENDS_A_MESSAGE_TO_A_SLACK_CHANNEL",
  hubspot_create_deal: "HUBSPOT_CRM_CREATE_DEAL",
  linkedin_create_post: "LINKEDIN_CREATE_LINKED_IN_POST",
} as const;

async function safe<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[composio-trigger:${label}]`, err);
    return null;
  }
}

/** Scan completed with overall < 70 → email the lead via the client's Gmail. */
export async function onLowScoreScan(args: {
  clientId: string | null;
  leadEmail: string | null;
  url: string;
  overall: number;
}): Promise<void> {
  if (!args.clientId || !args.leadEmail || args.overall >= 70) return;
  await safe("low-score-scan", async () => {
    const conn = await getActiveConnection(args.clientId!, "gmail");
    if (!conn) return;
    await executeTool(TOOL_SLUGS.gmail_send, args.clientId!, {
      recipient_email: args.leadEmail,
      subject: `Your AI-readiness scan for ${args.url}`,
      body:
        `Hi,\n\nWe ran an AI-readiness scan on ${args.url} and the overall score is ${args.overall}/100.\n` +
        `Anything under 70 means major AI assistants are likely skipping your content.\n\n` +
        `Reply if you'd like the full breakdown and a remediation plan.\n\n— citation.is`,
    });
  });
}

/** Scan score dropped >10 vs previous for same host → Slack alert to that client. */
export async function onScoreDrop(args: {
  clientId: string | null;
  url: string;
  prevOverall: number;
  newOverall: number;
}): Promise<void> {
  if (!args.clientId) return;
  if (args.prevOverall - args.newOverall <= 10) return;
  await safe("score-drop", async () => {
    const conn = await getActiveConnection(args.clientId!, "slack");
    if (!conn) return;
    const channel = (conn as unknown as { metadata?: { slackChannel?: string } }).metadata
      ?.slackChannel;
    await executeTool(TOOL_SLUGS.slack_send, args.clientId!, {
      channel: channel ?? "#general",
      text:
        `:warning: AI-readiness score dropped on *${args.url}*\n` +
        `*${args.prevOverall}* → *${args.newOverall}* (-${args.prevOverall - args.newOverall})`,
    });
  });
}

/**
 * New brief submitted → create a HubSpot deal on every client with HubSpot connected.
 * Briefs have no client_id, so this fans out to all connected workspaces.
 */
export async function onBriefSubmitted(args: {
  briefTitle: string;
  briefId: string;
  email?: string | null;
}): Promise<void> {
  await safe("brief-submitted", async () => {
    const connections = await listActiveConnectionsForToolkit("hubspot");
    if (connections.length === 0) return;
    await Promise.all(
      connections.map((conn) =>
        executeTool(TOOL_SLUGS.hubspot_create_deal, conn.client_id, {
          dealname: `Brief: ${args.briefTitle}`,
          dealstage: "Brief Received",
          amount: 0,
          ...(args.email ? { description: `From: ${args.email}` } : {}),
        }),
      ),
    );
  });
}

/** Blog post published → draft a LinkedIn post for every client with LinkedIn connected. */
export async function onPostPublished(args: {
  title: string;
  slug: string;
  excerpt?: string | null;
}): Promise<void> {
  await safe("post-published", async () => {
    const connections = await listActiveConnectionsForToolkit("linkedin");
    if (connections.length === 0) return;
    const url = `https://citation.is/blog/${args.slug}`;
    const commentary =
      `New on the citation.is blog: ${args.title}\n\n` +
      `${args.excerpt ?? ""}\n\n${url}`.trim();
    await Promise.all(
      connections.map((conn) =>
        executeTool(TOOL_SLUGS.linkedin_create_post, conn.client_id, {
          commentary,
          visibility: "PUBLIC",
        }),
      ),
    );
  });
}
