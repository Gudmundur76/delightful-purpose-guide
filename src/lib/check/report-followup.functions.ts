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
    // Fire both in parallel: prospect follow-up + internal hot-lead alert.
    const [followup, notify] = await Promise.allSettled([
      sendTransactionalEmailInternal({
        templateName: "report-followup",
        recipientEmail: data.email,
        templateData: { url: data.url, score: data.score },
        idempotencyKey: `report-followup:${data.email}:${data.url}`,
      }),
      sendTransactionalEmailInternal({
        templateName: "scan-lead-notification",
        templateData: { email: data.email, url: data.url, score: data.score },
        idempotencyKey: `scan-lead-notify:${data.email}:${data.url}`,
      }),
    ]);
    return {
      followup: followup.status === "fulfilled" ? followup.value : { ok: false },
      notify: notify.status === "fulfilled" ? notify.value : { ok: false },
    };
  });
