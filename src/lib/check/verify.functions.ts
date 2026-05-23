import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { fetchVerifyRecord } from "./verify.server";

export const getVerifyRecord = createServerFn({ method: "GET" })
  .inputValidator((data: { host: string }) =>
    z.object({ host: z.string().min(1).max(253) }).parse(data),
  )
  .handler(async ({ data }) => {
    const record = await fetchVerifyRecord(data.host);
    return { record };
  });
