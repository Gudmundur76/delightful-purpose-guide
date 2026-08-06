// Canonical list of AI assistant / answer-engine traffic sources.
// Used by the hosted attribution script and the /tools/ai-attribution page.

export type AiSource = {
  /** stable id emitted in events */
  id: string;
  /** human label */
  label: string;
  /** referrer hostname fragments (lowercase, matched with includes) */
  hosts: string[];
  /** utm_source values that identify this engine */
  utm: string[];
};

export const AI_SOURCES: AiSource[] = [
  {
    id: "chatgpt",
    label: "ChatGPT",
    hosts: ["chat.openai.com", "chatgpt.com", "openai.com"],
    utm: ["chatgpt", "openai"],
  },
  {
    id: "perplexity",
    label: "Perplexity",
    hosts: ["perplexity.ai"],
    utm: ["perplexity"],
  },
  {
    id: "claude",
    label: "Claude",
    hosts: ["claude.ai", "anthropic.com"],
    utm: ["claude", "anthropic"],
  },
  {
    id: "gemini",
    label: "Gemini / Google AI",
    hosts: ["gemini.google.com", "bard.google.com", "aistudio.google.com"],
    utm: ["gemini", "bard", "google-ai"],
  },
  {
    id: "copilot",
    label: "Microsoft Copilot",
    hosts: ["copilot.microsoft.com", "bing.com/chat", "edgeservices.bing.com"],
    utm: ["copilot", "bingchat"],
  },
  {
    id: "grok",
    label: "Grok",
    hosts: ["grok.com", "x.ai"],
    utm: ["grok"],
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    hosts: ["chat.deepseek.com", "deepseek.com"],
    utm: ["deepseek"],
  },
  {
    id: "mistral",
    label: "Le Chat (Mistral)",
    hosts: ["chat.mistral.ai", "mistral.ai"],
    utm: ["mistral", "lechat"],
  },
  {
    id: "meta-ai",
    label: "Meta AI",
    hosts: ["meta.ai"],
    utm: ["meta-ai", "metaai"],
  },
  {
    id: "you",
    label: "You.com",
    hosts: ["you.com"],
    utm: ["you.com", "youchat"],
  },
  {
    id: "phind",
    label: "Phind",
    hosts: ["phind.com"],
    utm: ["phind"],
  },
  {
    id: "poe",
    label: "Poe",
    hosts: ["poe.com"],
    utm: ["poe"],
  },
];

/** Classify a referrer + utm_source pair. Returns null when it isn't AI traffic. */
export function classify(referrer: string, utmSource?: string | null): AiSource | null {
  const ref = (referrer || "").toLowerCase();
  const utm = (utmSource || "").toLowerCase();
  for (const s of AI_SOURCES) {
    if (utm && s.utm.some((u) => utm === u || utm.includes(u))) return s;
    if (ref && s.hosts.some((h) => ref.includes(h))) return s;
  }
  return null;
}
