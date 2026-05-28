// Server-only Composio SDK wrapper. Never import from client code.
import { Composio } from "@composio/core";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { entityIdFor, type ToolkitSlug } from "./config";

let _client: Composio | null = null;

export function getComposio(): Composio {
  if (_client) return _client;
  const apiKey = process.env.COMPOSIO_API_KEY;
  if (!apiKey) throw new Error("COMPOSIO_API_KEY is not configured");
  _client = new Composio({ apiKey });
  return _client;
}

export interface ConnectionRow {
  id: string;
  client_id: string;
  toolkit: string;
  entity_id: string;
  connection_id: string | null;
  status: string;
}

/** Look up an ACTIVE connection for a (client, toolkit) pair. Returns null if none. */
export async function getActiveConnection(
  clientId: string,
  toolkit: ToolkitSlug,
): Promise<ConnectionRow | null> {
  const { data, error } = await supabaseAdmin
    .from("client_integrations")
    .select("id, client_id, toolkit, entity_id, connection_id, status")
    .eq("client_id", clientId)
    .eq("toolkit", toolkit)
    .eq("status", "active")
    .maybeSingle();
  if (error) {
    console.error("[composio] getActiveConnection failed", error);
    return null;
  }
  return (data as ConnectionRow | null) ?? null;
}

/** All ACTIVE connections for a toolkit across every client (used by global triggers). */
export async function listActiveConnectionsForToolkit(
  toolkit: ToolkitSlug,
): Promise<ConnectionRow[]> {
  const { data, error } = await supabaseAdmin
    .from("client_integrations")
    .select("id, client_id, toolkit, entity_id, connection_id, status")
    .eq("toolkit", toolkit)
    .eq("status", "active");
  if (error) {
    console.error("[composio] listActiveConnectionsForToolkit failed", error);
    return [];
  }
  return (data as ConnectionRow[] | null) ?? [];
}

/**
 * Execute a Composio tool as a given client. Wraps SDK shape variations.
 * Returns { success, result, error }.
 */
export async function executeTool(
  toolSlug: string,
  clientId: string,
  args: Record<string, unknown>,
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  try {
    const composio = getComposio();
    const userId = entityIdFor(clientId);
    // @composio/core ^0.6 exposes `tools.execute(slug, { userId, arguments })`
    const result = await composio.tools.execute(toolSlug, {
      userId,
      arguments: args,
    } as never);
    return { success: true, result };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[composio] executeTool ${toolSlug} failed for ${clientId}:`, msg);
    return { success: false, error: msg };
  }
}
