// Generic admin CRUD endpoint for KimiClaw / trusted agents.
// Gated by PUBLIC_API_KEY. Operates with service role (bypasses RLS).
//
// Methods on /api/public/v1/admin/:table
//   GET     ?select=col,col&limit=50&order=col.desc&col=eq.value&col=gt.value
//   POST    body: object | object[]  (insert, returns inserted rows)
//   PATCH   body: { match: { col: value, ... }, values: { ... } }   (update)
//   DELETE  body: { match: { col: value, ... } }                    (delete)
//
// Filter ops in query string (PostgREST-style):
//   col=eq.value, neq, gt, gte, lt, lte, like, ilike, is.null, in.(a,b,c)

import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { jsonResponse, optionsResponse, requireAdminApiKey } from "@/lib/api/auth";

// Whitelist of tables KimiClaw may touch. Add new tables here as the schema grows.
const ALLOWED_TABLES = new Set<string>([
  "leads",
  "email_send_log",
  "email_send_state",
  "email_unsubscribe_tokens",
  "suppressed_emails",
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQuery = any;

function applyFilters(q: any, url: URL) {
  const reserved = new Set(["select", "limit", "order", "offset"]);
  for (const [key, raw] of url.searchParams.entries()) {
    if (reserved.has(key)) continue;
    const [op, ...rest] = raw.split(".");
    const value = rest.join(".");
    switch (op) {
      case "eq": q = q.eq(key, value); break;
      case "neq": q = q.neq(key, value); break;
      case "gt": q = q.gt(key, value); break;
      case "gte": q = q.gte(key, value); break;
      case "lt": q = q.lt(key, value); break;
      case "lte": q = q.lte(key, value); break;
      case "like": q = q.like(key, value); break;
      case "ilike": q = q.ilike(key, value); break;
      case "is":
        q = q.is(key, value === "null" ? null : value);
        break;
      case "in": {
        const inner = value.replace(/^\(|\)$/g, "");
        q = q.in(key, inner.split(","));
        break;
      }
      default:
        q = q.eq(key, raw);
    }
  }
  return q;
}

function applyMatch(q: any, match: Record<string, unknown> | undefined) {
  if (!match || typeof match !== "object") return q;
  for (const [k, v] of Object.entries(match)) {
    q = v === null ? q.is(k, null) : q.eq(k, v as any);
  }
  return q;
}

export const Route = createFileRoute("/api/public/v1/admin/$table")({
  server: {
    handlers: {
      OPTIONS: async () => optionsResponse(),

      GET: async ({ request, params }) => {
        const unauth = requireAdminApiKey(request);
        if (unauth) return unauth;
        const { table } = params;
        if (!ALLOWED_TABLES.has(table)) {
          return jsonResponse({ error: `Table '${table}' is not allowed`, allowed: [...ALLOWED_TABLES] }, 403);
        }
        const url = new URL(request.url);
        const select = url.searchParams.get("select") || "*";
        const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 100, 1), 1000);
        const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);
        const order = url.searchParams.get("order");

        let q: AnyQuery = supabaseAdmin.from(table as any).select(select, { count: "exact" });
        q = applyFilters(q, url);
        if (order) {
          const [col, dir] = order.split(".");
          q = (q as any).order(col, { ascending: (dir ?? "asc") !== "desc" });
        }
        q = (q as any).range(offset, offset + limit - 1);

        const { data, error, count } = await (q as any);
        if (error) return jsonResponse({ error: error.message }, 400);
        return jsonResponse({ table, count: count ?? data?.length ?? 0, rows: data ?? [] });
      },

      POST: async ({ request, params }) => {
        const unauth = requireAdminApiKey(request);
        if (unauth) return unauth;
        const { table } = params;
        if (!ALLOWED_TABLES.has(table)) {
          return jsonResponse({ error: `Table '${table}' is not allowed` }, 403);
        }
        let body: unknown;
        try { body = await request.json(); } catch { return jsonResponse({ error: "Invalid JSON body" }, 400); }
        const { data, error } = await supabaseAdmin.from(table as any).insert(body as any).select();
        if (error) return jsonResponse({ error: error.message }, 400);
        return jsonResponse({ table, inserted: data?.length ?? 0, rows: data ?? [] }, 201);
      },

      PATCH: async ({ request, params }) => {
        const unauth = requireAdminApiKey(request);
        if (unauth) return unauth;
        const { table } = params;
        if (!ALLOWED_TABLES.has(table)) {
          return jsonResponse({ error: `Table '${table}' is not allowed` }, 403);
        }
        let body: any;
        try { body = await request.json(); } catch { return jsonResponse({ error: "Invalid JSON body" }, 400); }
        const { match, values } = body || {};
        if (!values || typeof values !== "object") {
          return jsonResponse({ error: "Body must include { values: {...} }" }, 400);
        }
        if (!match || Object.keys(match).length === 0) {
          return jsonResponse({ error: "Body must include non-empty { match: {...} } to prevent full-table updates" }, 400);
        }
        let q: any = supabaseAdmin.from(table as any).update(values);
        q = applyMatch(q, match);
        const { data, error } = await q.select();
        if (error) return jsonResponse({ error: error.message }, 400);
        return jsonResponse({ table, updated: data?.length ?? 0, rows: data ?? [] });
      },

      DELETE: async ({ request, params }) => {
        const unauth = requireAdminApiKey(request);
        if (unauth) return unauth;
        const { table } = params;
        if (!ALLOWED_TABLES.has(table)) {
          return jsonResponse({ error: `Table '${table}' is not allowed` }, 403);
        }
        let body: any = {};
        try { body = await request.json(); } catch { /* allow empty */ }
        const match = body?.match;
        if (!match || Object.keys(match).length === 0) {
          return jsonResponse({ error: "Body must include non-empty { match: {...} } to prevent full-table deletes" }, 400);
        }
        let q: any = supabaseAdmin.from(table as any).delete();
        q = applyMatch(q, match);
        const { data, error } = await q.select();
        if (error) return jsonResponse({ error: error.message }, 400);
        return jsonResponse({ table, deleted: data?.length ?? 0, rows: data ?? [] });
      },
    },
  },
});
