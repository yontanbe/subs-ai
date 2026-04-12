"use client";

import { useEffect, useState } from "react";

interface UsageSummary {
  service: string;
  model: string;
  action: string;
  total_calls: number;
  total_tokens_in: number;
  total_tokens_out: number;
  total_cost: string;
  avg_duration_ms: number;
  errors: number;
}

interface DailyCost {
  date: string;
  cost: string;
  calls: number;
}

interface UsageData {
  summary: UsageSummary[];
  dailyCost: DailyCost[];
  recentErrors: { service: string; error: string; created_at: string }[];
  totals: { total_cost: string; total_calls: number; total_tokens_in: number; total_tokens_out: number };
}

export default function AdminPage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/usage?days=${days}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white/90">API Usage Dashboard</h1>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="input-glass rounded-lg px-3 py-2 text-[13px] text-white/80"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="spinner mr-3" />
          <span className="text-white/40">Loading usage data…</span>
        </div>
      ) : !data ? (
        <p className="text-center text-white/40">Failed to load usage data</p>
      ) : (
        <div className="space-y-8">
          {/* Totals cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/30">Total Cost</p>
              <p className="mt-1 text-2xl font-bold text-[#e09145]">${data.totals?.total_cost || "0.00"}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/30">API Calls</p>
              <p className="mt-1 text-2xl font-bold text-white/80">{data.totals?.total_calls || 0}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/30">Tokens In</p>
              <p className="mt-1 text-2xl font-bold text-white/80">{(data.totals?.total_tokens_in || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/30">Tokens Out</p>
              <p className="mt-1 text-2xl font-bold text-white/80">{(data.totals?.total_tokens_out || 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Daily cost chart */}
          {data.dailyCost.length > 0 && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h2 className="mb-4 text-[14px] font-semibold text-white/70">Daily Cost</h2>
              <div className="space-y-2">
                {data.dailyCost.map((d) => {
                  const maxCost = Math.max(...data.dailyCost.map((x) => Number(x.cost)));
                  const pct = maxCost > 0 ? (Number(d.cost) / maxCost) * 100 : 0;
                  return (
                    <div key={d.date} className="flex items-center gap-3 text-[12px]">
                      <span className="w-20 text-white/30 font-mono">{d.date.slice(5)}</span>
                      <div className="flex-1 h-5 overflow-hidden rounded-full bg-white/[0.04]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#e09145]/80 to-[#f0b678]/80"
                          style={{ width: `${Math.max(2, pct)}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-white/50">${d.cost}</span>
                      <span className="w-12 text-right text-white/30">{d.calls}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Usage by service */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h2 className="mb-4 text-[14px] font-semibold text-white/70">Usage by Service</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-white/[0.06] text-left text-white/30 uppercase tracking-wider">
                    <th className="pb-2 pr-4">Service</th>
                    <th className="pb-2 pr-4">Model</th>
                    <th className="pb-2 pr-4">Action</th>
                    <th className="pb-2 pr-4 text-right">Calls</th>
                    <th className="pb-2 pr-4 text-right">Cost</th>
                    <th className="pb-2 pr-4 text-right">Avg ms</th>
                    <th className="pb-2 text-right">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {data.summary.map((row, i) => (
                    <tr key={i} className="border-b border-white/[0.03] text-white/60">
                      <td className="py-2 pr-4 font-medium text-white/80">{row.service}</td>
                      <td className="py-2 pr-4 font-mono text-[11px]">{row.model || "—"}</td>
                      <td className="py-2 pr-4">{row.action}</td>
                      <td className="py-2 pr-4 text-right">{row.total_calls}</td>
                      <td className="py-2 pr-4 text-right text-[#e09145]">${row.total_cost}</td>
                      <td className="py-2 pr-4 text-right">{row.avg_duration_ms}ms</td>
                      <td className="py-2 text-right">{row.errors > 0 ? <span className="text-red-400">{row.errors}</span> : "0"}</td>
                    </tr>
                  ))}
                  {data.summary.length === 0 && (
                    <tr><td colSpan={7} className="py-8 text-center text-white/30">No usage data yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent errors */}
          {data.recentErrors.length > 0 && (
            <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.02] p-5">
              <h2 className="mb-4 text-[14px] font-semibold text-red-400/80">Recent Errors</h2>
              <div className="space-y-2">
                {data.recentErrors.map((err, i) => (
                  <div key={i} className="rounded-lg bg-red-500/5 px-3 py-2 text-[12px]">
                    <span className="font-medium text-red-400">{err.service}</span>
                    <span className="ml-2 text-white/40">{err.error}</span>
                    <span className="ml-2 text-white/20">{new Date(err.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
