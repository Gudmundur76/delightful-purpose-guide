import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface Client {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const CreateSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  domain: z.string().max(2048).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const createClient = createServerFn({ method: "POST" })
  .middleware([])
  .inputValidator((input: unknown) => CreateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const userId = (context as any).userId;
    if (!userId) throw new Error("Unauthorized");

    const { data: client, error } = await supabaseAdmin
      .from("clients")
      .insert({
        name: data.name,
        slug: data.slug,
        domain: data.domain || null,
        notes: data.notes || null,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { client: client as Client };
  });

export const listClients = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("clients")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return { clients: (data ?? []) as Client[] };
});

export const getClient = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: client, error } = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("id", data.id)
      .single();

    if (error) throw new Error(error.message);
    return { client: client as Client | null };
  });

export const deleteClient = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("clients").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getClientScans = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ clientId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: scans, error } = await supabaseAdmin
      .from("scans")
      .select("id, url, host, overall, semantic, jsonld, llms, citability, speed, scanned_at")
      .eq("client_id", data.clientId)
      .order("scanned_at", { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    return { scans: scans ?? [] };
  });
