import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendTransactionalEmailInternal } from "@/lib/email/send-internal";
import { CALENDLY_URL, PRICING_URL } from "./links";

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const FAST_MODEL = "google/gemini-2.5-flash";

export interface LeadInput {
  id: string;
  name: string;
  email: string;
  budget_tier: string;
  message: string;
}

export interface QualificationResult {
  score: number;
  tier: "cold" | "warm" | "hot";
  reasoning: string;
  suggested_tier: "starter" | "growth" | "enterprise";
  reply_subject: string;
  reply_body: string;
}

const SYSTEM_PROMPT = `You are the qualification engine for citation.is, a boutique studio that ships agent-native websites for AI startups in 48 hours (Starter, $2,400) or 5 days (Growth, $6,800). Enterprise engagements ($15k+) go to a custom quote.

You receive raw contact-form leads and produce two outputs in a single tool call:
1. A qualification grade (score 0-100, tier cold/warm/hot, brief reasoning).
2. A warm, founder-to-founder reply email the studio will send automatically.

Scoring rubric:
- 80-100 (hot): Funded AI/devtools startup, clear urgency, named timeline, budget signal at or above Growth tier, technical decision-maker.
- 50-79 (warm): Real business, fit but vague timeline OR budget at Starter tier OR mid-funnel intent (researching, comparing options).
- 0-49 (cold): Wrong audience (students, agencies pitching us, generic SEO requests), spam-shaped, missing context, or explicitly outside our scope.

Suggested tier mapping:
- Hot + Growth/Enterprise budget signal -> "growth" or "enterprise"
- Warm or Starter budget -> "starter"
- Cold -> "starter" (still gives a friendly response)

Reply email rules:
- Subject: short, specific, mentions their company/use case if discernible. No "Re:" prefix. Title case off — sentence case.
- Body: 80-160 words. Plain text. No HTML. Reference one concrete detail from their message so it never feels templated.
- Hot leads: propose a 20-min call, include this Calendly link verbatim: ${CALENDLY_URL}
- Warm leads: link pricing (${PRICING_URL}), invite them to reply with timeline/budget. No Calendly link.
- Cold leads: polite, brief, honest — explain we focus on AI startups, link pricing for transparency. No Calendly link.
- Always sign off as "— Grow Studio" (no individual name).
- Never invent facts about the studio. Never make up case studies, client names, or pricing other than what's in this prompt.`;

export async function qualifyAndReply(lead: LeadInput): Promise<QualificationResult | null> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    console.error("[qualify] LOVABLE_API_KEY missing");
    return null;
  }

  const userPrompt = `New lead:
Name: ${lead.name}
Email: ${lead.email}
Budget tier (self-reported): ${lead.budget_tier}
Message:
"""
${lead.message}
"""`;

  const body = {
    model: FAST_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "qualify_lead",
          description: "Return qualification grade and a ready-to-send reply email.",
          parameters: {
            type: "object",
            properties: {
              score: { type: "integer", minimum: 0, maximum: 100 },
              tier: { type: "string", enum: ["cold", "warm", "hot"] },
              reasoning: { type: "string", description: "1-2 sentences, internal-only." },
              suggested_tier: { type: "string", enum: ["starter", "growth", "enterprise"] },
              reply_subject: { type: "string" },
              reply_body: { type: "string", description: "Plain-text body, 80-160 words." },
            },
            required: ["score", "tier", "reasoning", "suggested_tier", "reply_subject", "reply_body"],
            additionalProperties: false,
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "qualify_lead" } },
  };

  try {
    const res = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[qualify] AI gateway ${res.status}: ${text.slice(0, 300)}`);
      return null;
    }

    const data = await res.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const argsRaw = toolCall?.function?.arguments;
    if (!argsRaw) {
      console.error("[qualify] no tool call in AI response");
      return null;
    }
    const parsed = JSON.parse(argsRaw) as QualificationResult;
    return parsed;
  } catch (err) {
    console.error("[qualify] gateway call failed", err);
    return null;
  }
}

/**
 * Score the lead, write results back to DB, send auto-reply + high-priority
 * internal notification when hot. All failures are swallowed — caller's
 * 200 response must not be blocked.
 */
export async function qualifyLeadAndSendReplies(lead: LeadInput): Promise<void> {
  const result = await qualifyAndReply(lead);
  if (!result) return;

  // Persist qualification + reply text.
  const { error: updateErr } = await supabaseAdmin
    .from("leads")
    .update({
      qualification_score: result.score,
      qualification_tier: result.tier,
      qualification_reasoning: result.reasoning,
      qualification_suggested_tier: result.suggested_tier,
      auto_reply_subject: result.reply_subject,
      auto_reply_body: result.reply_body,
      auto_replied_at: new Date().toISOString(),
    })
    .eq("id", lead.id);
  if (updateErr) console.error("[qualify] update lead failed", updateErr);

  // Send AI-drafted auto-reply to the lead.
  const sends: Promise<unknown>[] = [
    sendTransactionalEmailInternal({
      templateName: "lead-auto-reply",
      recipientEmail: lead.email,
      idempotencyKey: `lead-auto-reply-${lead.id}`,
      templateData: {
        name: lead.name,
        subject: result.reply_subject,
        body: result.reply_body,
      },
    }).catch((e) => console.error("[qualify] auto-reply send failed", e)),
  ];

  // Hot leads: also push a high-priority internal notification.
  if (result.tier === "hot") {
    sends.push(
      sendTransactionalEmailInternal({
        templateName: "lead-hot-notification",
        idempotencyKey: `lead-hot-notify-${lead.id}`,
        templateData: {
          name: lead.name,
          email: lead.email,
          budgetTier: lead.budget_tier,
          message: lead.message,
          score: result.score,
          reasoning: result.reasoning,
          suggestedTier: result.suggested_tier,
        },
      }).catch((e) => console.error("[qualify] hot notify send failed", e)),
    );
  }

  await Promise.allSettled(sends);
}
