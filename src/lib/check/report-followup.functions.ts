import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sendTransactionalEmailInternal } from "@/lib/email/send-internal";

const Schema = z.object({
  email: z.string().email().max(254),
  url: z.string().min(1).max(2048),
  score: z.number().min(0).max(100),
});

export const sendReportFollowup = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Schema.parse(input))
  .handler(async ({ data }) => {
    const result = await sendTransactionalEmailInternal({
      templateName: "report-followup",
      recipientEmail: data.email,
      templateData: { url: data.url, score: data.score },
      idempotencyKey: `report-followup:${data.email}:${data.url}`,
    });
    return result;
  });
