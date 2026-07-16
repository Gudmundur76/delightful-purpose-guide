// Server functions for the /integrations UI. Auth-protected.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getComposio } from "./composio.server";
import { entityIdFor, TOOLKITS, VALID_TOOLKIT_SLUGS, type ToolkitSlug } from "./config";

const ClientIdInput = z.object({ clientId: z.string().uuid() });
const ToolkitInput = z.object({
  clientId: z.string().uuid(),
  toolkit: z.string().refine((s) => VALID_TOOLKIT_SLUGS.has(s), {
    message: "Unsupported toolkit",
  }),
});

export interface IntegrationStatusRow {
  toolkit: ToolkitSlug;
  name: string;
  purpose: string;
  status: "not_connected" | "pending" | "active" | "error";
  connectionId: string | null;
}

/** List the 6 toolkits with the given client's current connection status. */
export const listIntegrations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ClientIdInput.parse(input))
  .handler(async ({ data }): Promise<IntegrationStatusRow[]> => {
    const { data: rows } = await supabaseAdmin
      .from("client_integrations")
      .select("toolkit, status, connection_id")
      .eq("client_id", data.clientId);
    const byToolkit = new Map(
      (rows ?? []).map((r) => [r.toolkit as string, r] as const),
    );
    return TOOLKITS.map((t) => {
      const row = byToolkit.get(t.slug);
      const status = (row?.status as IntegrationStatusRow["status"] | undefined) ?? "not_connected";
      return {
        toolkit: t.slug,
        name: t.name,
        purpose: t.purpose,
        status,
        connectionId: row?.connection_id ?? null,
      };
    });
  });

/**
 * Kick off Composio's managed OAuth for a (client, toolkit).
 * Returns a redirect URL the browser should send the user to.
 */
export const initiateConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ToolkitInput.parse(input))
  .handler(async ({ data }): Promise<{ redirectUrl: string | null; connectionId: string }> => {
    const toolkit = data.toolkit as ToolkitSlug;
    const composio = getComposio();
    const userId = entityIdFor(data.clientId);

    // Resolve the Composio Auth Config ID for this toolkit. Either:
    //   - via an env var (COMPOSIO_AUTH_CONFIG_<TOOLKIT>), or
    //   - by listing existing auth configs filtered by toolkit and picking the first.
    const envName = `COMPOSIO_AUTH_CONFIG_${toolkit.toUpperCase()}`;
    let authConfigId: string | undefined = process.env[envName];

    if (!authConfigId) {
      try {
        // SDK shape: composio.authConfigs.list({ toolkit })
        const list = (await (composio as unknown as {
          authConfigs: { list: (a: { toolkit?: string }) => Promise<{ items?: Array<{ id: string }> }> };
        }).authConfigs.list({ toolkit })) as { items?: Array<{ id: string }> };
        authConfigId = list?.items?.[0]?.id;
      } catch (err) {
        console.error("[composio] authConfigs.list failed", err);
      }
    }
    if (!authConfigId) {
      throw new Error(
        `No Composio auth config found for ${toolkit}. Create one in the Composio dashboard or set ${envName}.`,
      );
    }

    // SDK shape: composio.connectedAccounts.initiate(userId, authConfigId, { ... })
    const callbackUrl = "https://citation.is/integrations";
    const initiation = (await (composio as unknown as {
      connectedAccounts: {
        initiate: (
          uid: string,
          cfg: string,
          opts: { callbackUrl?: string },
        ) => Promise<{ id: string; redirectUrl?: string | null }>;
      };
    }).connectedAccounts.initiate(userId, authConfigId, { callbackUrl })) as {
      id: string;
      redirectUrl?: string | null;
    };

    // Upsert pending row.
    const { error } = await supabaseAdmin
      .from("client_integrations")
      .upsert(
        {
          client_id: data.clientId,
          toolkit,
          entity_id: userId,
          connection_id: initiation.id,
          status: "pending",
          metadata: { authConfigId },
        },
        { onConflict: "client_id,toolkit" },
      );
    if (error) throw new Error(error.message);

    return { redirectUrl: initiation.redirectUrl ?? null, connectionId: initiation.id };
  });

/** Re-check Composio for ACTIVE state and flip the local row. */
export const refreshConnectionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ToolkitInput.parse(input))
  .handler(async ({ data }): Promise<{ status: string }> => {
    const { data: row } = await supabaseAdmin
      .from("client_integrations")
      .select("connection_id")
      .eq("client_id", data.clientId)
      .eq("toolkit", data.toolkit)
      .maybeSingle();
    if (!row?.connection_id) return { status: "not_connected" };

    const composio = getComposio();
    let nextStatus = "pending";
    try {
      const ca = (await (composio as unknown as {
        connectedAccounts: { get: (id: string) => Promise<{ status?: string }> };
      }).connectedAccounts.get(row.connection_id)) as { status?: string };
      const composioStatus = (ca?.status ?? "").toUpperCase();
      if (composioStatus === "ACTIVE") nextStatus = "active";
      else if (composioStatus === "FAILED" || composioStatus === "EXPIRED") nextStatus = "error";
      else nextStatus = "pending";
    } catch (err) {
      console.error("[composio] connectedAccounts.get failed", err);
      nextStatus = "error";
    }

    await supabaseAdmin
      .from("client_integrations")
      .update({ status: nextStatus })
      .eq("client_id", data.clientId)
      .eq("toolkit", data.toolkit);
    return { status: nextStatus };
  });

/** Remove a connection (Composio + local row). */
export const disconnectIntegration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ToolkitInput.parse(input))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { data: row } = await supabaseAdmin
      .from("client_integrations")
      .select("connection_id")
      .eq("client_id", data.clientId)
      .eq("toolkit", data.toolkit)
      .maybeSingle();
    if (row?.connection_id) {
      try {
        const composio = getComposio();
        await (composio as unknown as {
          connectedAccounts: { delete: (id: string) => Promise<unknown> };
        }).connectedAccounts.delete(row.connection_id);
      } catch (err) {
        console.error("[composio] connectedAccounts.delete failed (continuing)", err);
      }
    }
    await supabaseAdmin
      .from("client_integrations")
      .delete()
      .eq("client_id", data.clientId)
      .eq("toolkit", data.toolkit);
    return { ok: true };
  });

/** Helper for the page: list clients the team manages, for the picker. */
export const listClientsForIntegrations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("clients")
      .select("id, name, slug, domain")
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
