// Browser client for the admin platform API. Reuses the MCP secret stored
// in localStorage by dashboard.tsx.
import { getStoredSecret } from "./mcp-client";

const ENDPOINT = "/api/public/admin/platform";

export async function callPlatform<T = unknown>(action: string, args: Record<string, unknown> = {}): Promise<T> {
  const secret = getStoredSecret();
  if (!secret) throw new Error("Missing dashboard secret");
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
    body: JSON.stringify({ action, ...args }),
  });
  const data = (await res.json()) as { error?: string } & Record<string, unknown>;
  if (!res.ok || data.error) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data as T;
}
