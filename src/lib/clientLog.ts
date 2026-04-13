// Client-side logging to Neon for debugging production issues

export async function logClient(
  context: string,
  message: string,
  extra?: Record<string, unknown>,
  stack?: string,
): Promise<void> {
  try {
    await fetch("/api/client-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context,
        message,
        stack,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        url: typeof window !== "undefined" ? window.location.href : "",
        extra,
      }),
      keepalive: true,
    });
  } catch {
    // Logging must never fail the main flow
  }
}

export function logStep(context: string, step: string, extra?: Record<string, unknown>) {
  return logClient(context, `STEP: ${step}`, extra);
}

export function logError(context: string, err: unknown, extra?: Record<string, unknown>) {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  return logClient(context, message, extra, stack);
}
