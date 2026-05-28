// Composio integration config — client-safe constants only.
// Secrets (COMPOSIO_API_KEY) are read server-side inside .handler() scopes.

export const COMPOSIO_ENTITY_PREFIX = "grow_contact_";

export type ToolkitSlug =
  | "gmail"
  | "hubspot"
  | "slack"
  | "linkedin"
  | "pipedrive"
  | "google_analytics";

export interface ToolkitMeta {
  slug: ToolkitSlug;
  name: string;
  purpose: string;
  authConfigEnv?: string; // optional Composio Auth Config ID env var name
}

export const TOOLKITS: ToolkitMeta[] = [
  {
    slug: "gmail",
    name: "Gmail",
    purpose: "Send outreach emails and score reports as the client.",
    authConfigEnv: "COMPOSIO_AUTH_CONFIG_GMAIL",
  },
  {
    slug: "hubspot",
    name: "HubSpot",
    purpose: "Sync briefs and leads into the client's CRM.",
    authConfigEnv: "COMPOSIO_AUTH_CONFIG_HUBSPOT",
  },
  {
    slug: "pipedrive",
    name: "Pipedrive",
    purpose: "Alternative CRM sync for clients on Pipedrive.",
    authConfigEnv: "COMPOSIO_AUTH_CONFIG_PIPEDRIVE",
  },
  {
    slug: "slack",
    name: "Slack",
    purpose: "Post score-change alerts into the client's workspace.",
    authConfigEnv: "COMPOSIO_AUTH_CONFIG_SLACK",
  },
  {
    slug: "linkedin",
    name: "LinkedIn",
    purpose: "Draft outreach posts for client approval.",
    authConfigEnv: "COMPOSIO_AUTH_CONFIG_LINKEDIN",
  },
  {
    slug: "google_analytics",
    name: "Google Analytics",
    purpose: "Correlate scan changes with traffic.",
    authConfigEnv: "COMPOSIO_AUTH_CONFIG_GOOGLE_ANALYTICS",
  },
];

export function entityIdFor(clientId: string): string {
  return `${COMPOSIO_ENTITY_PREFIX}${clientId}`;
}

export const VALID_TOOLKIT_SLUGS = new Set<string>(TOOLKITS.map((t) => t.slug));
