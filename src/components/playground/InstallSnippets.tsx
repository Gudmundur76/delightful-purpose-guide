import { useState } from "react";
import { Check, Copy } from "lucide-react";

const TABS = ["Claude Desktop", "ChatGPT", "cURL", "n8n", "mcp.json"] as const;
type Tab = (typeof TABS)[number];

const ENDPOINT = "https://citation.is/api/public/mcp";

const SNIPPETS: Record<Tab, { lang: string; code: string }> = {
  "Claude Desktop": {
    lang: "json",
    code: `{
  "mcpServers": {
    "grow-contact": {
      "url": "${ENDPOINT}",
      "headers": {
        "Authorization": "Bearer YOUR_MCP_SECRET"
      }
    }
  }
}`,
  },
  ChatGPT: {
    lang: "text",
    code: `In a Custom GPT → Actions → Import OpenAPI:
${"https://citation.is/api/public/v1/openapi.json"}

For the MCP endpoint (Custom Connector beta):
URL:    ${ENDPOINT}
Auth:   Bearer YOUR_MCP_SECRET
Method: POST (Streamable HTTP)`,
  },
  cURL: {
    lang: "bash",
    code: `curl -X POST ${ENDPOINT} \\
  -H "Authorization: Bearer YOUR_MCP_SECRET" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json, text/event-stream" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "scan_url",
      "arguments": { "url": "https://example.com" }
    }
  }'`,
  },
  n8n: {
    lang: "text",
    code: `Use the MCP Client node:
- Server URL: ${ENDPOINT}
- Transport:  Streamable HTTP
- Auth:       Header → Authorization: Bearer YOUR_MCP_SECRET

Or HTTP Request node:
- POST ${ENDPOINT}
- Body: { "jsonrpc": "2.0", "method": "tools/call", ... }`,
  },
  "mcp.json": {
    lang: "json",
    code: `// Discovery — no auth required
GET https://citation.is/.well-known/mcp.json
GET https://citation.is/.well-known/mcp/server-card.json

// OAuth (gets you an MCP_SECRET)
POST https://citation.is/api/public/oauth/token`,
  },
};

export function InstallSnippets() {
  const [tab, setTab] = useState<Tab>("Claude Desktop");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(SNIPPETS[tab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="border border-border bg-card/40">
      <div className="flex flex-wrap border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest border-r border-border transition-colors ${
              tab === t
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
        <button
          onClick={copy}
          className="ml-auto px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
          aria-label="Copy snippet"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-5 overflow-x-auto text-xs leading-relaxed font-mono text-foreground/90 whitespace-pre">
        <code>{SNIPPETS[tab].code}</code>
      </pre>
    </div>
  );
}
