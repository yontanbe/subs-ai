"use client";

import { useEffect, useState } from "react";

interface ClientError {
  id: string;
  context: string;
  message: string;
  stack: string | null;
  user_agent: string | null;
  url: string | null;
  extra: Record<string, unknown> | null;
  created_at: string;
}

export default function ErrorsPage() {
  const [errors, setErrors] = useState<ClientError[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/client-log")
      .then((r) => r.json())
      .then((d) => setErrors(d.errors || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white/90">Client Errors & Logs</h1>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-[13px] text-white/70 transition hover:bg-white/[0.08]"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="spinner mr-3" />
          <span className="text-white/40">Loading…</span>
        </div>
      ) : errors.length === 0 ? (
        <p className="text-center text-white/40 py-20">No errors logged yet</p>
      ) : (
        <div className="space-y-2">
          {errors.map((err) => {
            const isStep = err.message.startsWith("STEP:");
            const isExpanded = expandedId === err.id;
            return (
              <div
                key={err.id}
                className={`rounded-xl border ${isStep ? "border-cyan-500/10 bg-cyan-500/[0.02]" : "border-red-500/10 bg-red-500/[0.02]"} p-3`}
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : err.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${isStep ? "text-cyan-400" : "text-red-400"}`}>
                          {err.context}
                        </span>
                        <span className="text-[10px] text-white/30">
                          {new Date(err.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className={`mt-1 text-[13px] ${isStep ? "text-cyan-200/70" : "text-white/80"} break-all`}>
                        {err.message}
                      </p>
                    </div>
                    <span className="text-white/30 text-sm">{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-2 border-t border-white/[0.05] pt-3 text-[11px]">
                    {err.stack && (
                      <pre className="overflow-x-auto rounded bg-black/40 p-3 text-white/50 font-mono text-[10px]">
                        {err.stack}
                      </pre>
                    )}
                    {err.extra && (
                      <pre className="overflow-x-auto rounded bg-black/40 p-3 text-cyan-300/70 font-mono text-[10px]">
                        {JSON.stringify(err.extra, null, 2)}
                      </pre>
                    )}
                    <div className="text-white/30">
                      <div>URL: {err.url}</div>
                      <div className="truncate">UA: {err.user_agent}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
