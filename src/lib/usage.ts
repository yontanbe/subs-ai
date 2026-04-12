import { neon } from "@neondatabase/serverless";

interface UsageLog {
  userId?: string | null;
  service: string;
  model?: string;
  action: string;
  tokensIn?: number;
  tokensOut?: number;
  costUsd?: number;
  durationMs?: number;
  status?: "success" | "error";
  error?: string;
}

// Non-blocking fire-and-forget usage logger
export async function logUsage(data: UsageLog): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    const sql = neon(process.env.DATABASE_URL);
    await sql`
      INSERT INTO api_usage (user_id, service, model, action, tokens_in, tokens_out, cost_usd, duration_ms, status, error)
      VALUES (
        ${data.userId ?? null},
        ${data.service},
        ${data.model ?? null},
        ${data.action},
        ${data.tokensIn ?? 0},
        ${data.tokensOut ?? 0},
        ${data.costUsd ?? 0},
        ${data.durationMs ?? 0},
        ${data.status ?? "success"},
        ${data.error ?? null}
      )
    `;
  } catch {
    // Logging failure should never break the main flow
  }
}

// Pricing constants (USD per 1M tokens)
export const PRICING = {
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gemini-2.0-flash-lite": { input: 0.075, output: 0.3 },
  "gemini-2.0-flash-exp": { input: 0.1, output: 0.4 },
} as const;

export function estimateCost(
  model: keyof typeof PRICING,
  tokensIn: number,
  tokensOut: number,
): number {
  const p = PRICING[model];
  if (!p) return 0;
  return (tokensIn * p.input + tokensOut * p.output) / 1_000_000;
}
