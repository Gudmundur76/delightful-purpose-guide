// Browser-side MCP client. Calls the public MCP JSON-RPC endpoint with the
// user-supplied bearer token stored in localStorage.

const ENDPOINT = "/api/public/mcp";
const STORAGE_KEY = "mcp_secret";

export function getStoredSecret(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setStoredSecret(value: string) {
  window.localStorage.setItem(STORAGE_KEY, value);
}

export function clearStoredSecret() {
  window.localStorage.removeItem(STORAGE_KEY);
}

let rpcId = 1;

export async function callTool<T = unknown>(
  name: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  const secret = getStoredSecret();
  if (!secret) throw new Error("Missing MCP secret");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: rpcId++,
      method: "tools/call",
      params: { name, arguments: args },
    }),
  });

  const ct = res.headers.get("content-type") ?? "";
  let payload: unknown;
  if (ct.includes("text/event-stream")) {
    const text = await res.text();
    // Parse SSE - pick the last "data:" line that's valid JSON.
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("data:"))
      .map((l) => l.slice(5).trim());
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        payload = JSON.parse(lines[i]);
        break;
      } catch {
        // ignore
      }
    }
  } else {
    payload = await res.json();
  }

  if (!res.ok) {
    throw new Error(`MCP HTTP ${res.status}`);
  }

  const obj = payload as {
    error?: { message?: string };
    result?: { content?: Array<{ type: string; text?: string }>; isError?: boolean };
  };

  if (obj.error) throw new Error(obj.error.message ?? "MCP error");
  const content = obj.result?.content ?? [];
  const textPart = content.find((c) => c.type === "text");
  if (!textPart?.text) return undefined as T;

  try {
    return JSON.parse(textPart.text) as T;
  } catch {
    return textPart.text as unknown as T;
  }
}
