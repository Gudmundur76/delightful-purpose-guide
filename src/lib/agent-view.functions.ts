import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const UA = "grow-contact-agent-view/1.0";
const TIMEOUT = 8000;

async function safeFetch(url: string, init: RequestInit = {}) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": UA, ...(init.headers as Record<string, string> | undefined) },
      signal: AbortSignal.timeout(TIMEOUT),
      ...init,
    });
    return res;
  } catch {
    return null;
  }
}

function originOf(url: string) {
  const u = new URL(url);
  return `${u.protocol}//${u.host}`;
}

function extractJsonLd(html: string) {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const types = new Set<string>();
  let count = 0;
  let valid = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    count++;
    try {
      const parsed = JSON.parse(m[1].trim());
      valid++;
      const collect = (node: unknown) => {
        if (!node || typeof node !== "object") return;
        const obj = node as Record<string, unknown>;
        const t = obj["@type"];
        if (typeof t === "string") types.add(t);
        else if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && types.add(x));
        const graph = obj["@graph"];
        if (Array.isArray(graph)) graph.forEach(collect);
      };
      collect(parsed);
    } catch {
      /* ignore parse errors */
    }
  }
  return { count, valid, types: Array.from(types) };
}

function clarityScore(html: string) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
  const description =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i)?.[1] ?? "";
  const h1s = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) ?? [];
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const textLen = text.length;
  const htmlLen = html.length || 1;
  const ratio = textLen / htmlLen;
  const lang = html.match(/<html[^>]+lang=["']([^"']+)/i)?.[1] ?? null;

  // Each signal worth points; total 100.
  let score = 0;
  const reasons: string[] = [];
  if (title.length >= 10 && title.length <= 70) {
    score += 20;
  } else {
    reasons.push(title ? `title length ${title.length} outside 10–70` : "missing <title>");
  }
  if (description.length >= 50 && description.length <= 200) {
    score += 20;
  } else {
    reasons.push(description ? `description length ${description.length} outside 50–200` : "missing meta description");
  }
  if (h1s.length === 1) {
    score += 20;
  } else {
    reasons.push(h1s.length === 0 ? "no <h1>" : `${h1s.length} <h1> tags (want 1)`);
  }
  if (ratio >= 0.05) {
    score += 20;
  } else {
    reasons.push(`text-to-html ratio ${(ratio * 100).toFixed(1)}% (want ≥5%)`);
  }
  if (textLen >= 1500) {
    score += 10;
  } else {
    reasons.push(`only ${textLen} chars of body text (want ≥1500)`);
  }
  if (lang) {
    score += 10;
  } else {
    reasons.push("no <html lang>");
  }
  return { score, title, description, h1Count: h1s.length, textLen, ratio, lang, reasons };
}

async function probeAgentEndpoints(origin: string) {
  const endpoints = [
    { key: "mcp", path: "/.well-known/mcp.json", label: "MCP server card" },
    { key: "mcpAlt", path: "/api/mcp", label: "MCP endpoint" },
    { key: "agentSkills", path: "/.well-known/agent-skills/index.json", label: "Agent skills index" },
    { key: "apiCatalog", path: "/.well-known/api-catalog", label: "API catalog" },
    { key: "openapi", path: "/openapi.json", label: "OpenAPI spec" },
    { key: "llmsTxt", path: "/llms.txt", label: "llms.txt" },
    { key: "robotsTxt", path: "/robots.txt", label: "robots.txt" },
    { key: "sitemap", path: "/sitemap.xml", label: "sitemap.xml" },
  ] as const;
  const results = await Promise.all(
    endpoints.map(async (e) => {
      const res = await safeFetch(origin + e.path, { method: "GET" });
      return {
        key: e.key,
        path: e.path,
        label: e.label,
        found: !!res && res.status >= 200 && res.status < 400,
        status: res?.status ?? 0,
      };
    }),
  );
  return results;
}

export const analyzeAgentView = createServerFn({ method: "POST" })
  .inputValidator((input: { url: string }) =>
    z.object({ url: z.string().url().max(2048) }).parse(input),
  )
  .handler(async ({ data }) => {
    const target = data.url;
    const origin = originOf(target);
    const pageRes = await safeFetch(target);
    if (!pageRes) {
      return {
        ok: false as const,
        error: "Could not reach URL (timeout or DNS failure).",
        url: target,
      };
    }
    const html = await pageRes.text();
    const schema = extractJsonLd(html);
    const clarity = clarityScore(html);
    const endpoints = await probeAgentEndpoints(origin);

    // Three Neil Patel signals → pass/fail
    const schemaPass = schema.valid > 0;
    const clarityPass = clarity.score >= 70;
    const apiPass = endpoints.some(
      (e) => e.found && ["mcp", "mcpAlt", "agentSkills", "apiCatalog", "openapi"].includes(e.key),
    );
    const signalsPassed = [schemaPass, clarityPass, apiPass].filter(Boolean).length;

    return {
      ok: true as const,
      url: target,
      origin,
      status: pageRes.status,
      schema: { ...schema, pass: schemaPass },
      clarity: { ...clarity, pass: clarityPass },
      endpoints,
      api: { pass: apiPass },
      signalsPassed,
    };
  });
