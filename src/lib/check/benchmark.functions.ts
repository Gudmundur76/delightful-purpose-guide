// Benchmark a single score against the population of scans we've performed.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const Schema = z.object({ score: z.number().min(0).max(100) });

export interface BenchmarkResult {
  yourScore: number;
  sampleSize: number;
  avgOverall: number;
  top10Avg: number;
  bottom50Threshold: number;
  percentileBeaten: number; // % of scans the user beats
  verdict: "above" | "below" | "average";
}

export const getBenchmark = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Schema.parse(input))
  .handler(async ({ data }): Promise<BenchmarkResult> => {
    const { data: rows } = await supabaseAdmin
      .from("scans")
      .select("overall")
      .order("scanned_at", { ascending: false })
      .limit(1000);

    const scores = (rows ?? []).map((r) => r.overall).filter((n) => typeof n === "number");
    const n = scores.length;
    if (n === 0) {
      return {
        yourScore: data.score,
        sampleSize: 0,
        avgOverall: 0,
        top10Avg: 0,
        bottom50Threshold: 0,
        percentileBeaten: 0,
        verdict: "average",
      };
    }
    const sorted = [...scores].sort((a, b) => a - b);
    const avg = Math.round(sorted.reduce((s, v) => s + v, 0) / n);
    const top10Slice = sorted.slice(Math.max(0, Math.floor(n * 0.9)));
    const top10Avg = Math.round(top10Slice.reduce((s, v) => s + v, 0) / Math.max(1, top10Slice.length));
    const bottom50Threshold = sorted[Math.floor(n * 0.5)] ?? 0;
    const beaten = sorted.filter((v) => v < data.score).length;
    const percentileBeaten = Math.round((beaten / n) * 100);
    const verdict: BenchmarkResult["verdict"] =
      data.score >= avg + 5 ? "above" : data.score <= avg - 5 ? "below" : "average";

    return {
      yourScore: data.score,
      sampleSize: n,
      avgOverall: avg,
      top10Avg,
      bottom50Threshold,
      percentileBeaten,
      verdict,
    };
  });
