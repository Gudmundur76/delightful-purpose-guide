import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { generateOutreach } from "@/lib/outreach/generate.functions";

export const generateOutreachTool = defineTool({
  name: "generate_outreach_email",
  description:
    "Generate a personalized B2B cold-email pitch for a prospect based on a live GEO scan of their URL. Returns subject + body powered by Gemini.",
  parameters: z.object({
    url: z.string().min(3).max(2048),
    senderName: z.string().min(1).max(120),
    recipientName: z.string().max(120).optional(),
    recipientCompany: z.string().max(160).optional(),
    tone: z.enum(["direct", "warm", "playful"]).default("direct"),
  }),
  execute: async (input) => {
    const result = await generateOutreach({ data: input });
    return JSON.stringify(result, null, 2);
  },
});
