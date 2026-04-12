"use client";

import { useEffect, useState } from "react";
import { getHistory, removeHistoryEntry, clearHistory } from "@/lib/history";
import type { HistoryEntry } from "@/types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function FileHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  const handleRemove = (id: string) => {
    removeHistoryEntry(id);
    setEntries(getHistory());
  };

  const handleClear = () => {
    clearHistory();
    setEntries([]);
  };

  if (entries.length === 0) return null;

  const visible = expanded ? entries : entries.slice(0, 3);

  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e09145]/10">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[#e09145]">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-white/80">Recent Projects</h3>
            <p className="text-[10px] text-white/30">{entries.length} file{entries.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {entries.length > 0 && (
          <button
            onClick={handleClear}
            className="rounded-lg px-2 py-1 text-[10px] font-medium text-white/25 transition hover:bg-white/[0.04] hover:text-white/50"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-2">
        {visible.map((entry) => (
          <div
            key={entry.id}
            className="group flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 transition hover:border-white/[0.08]"
          >
            {entry.thumbnailDataUrl ? (
              <div className="h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-white/[0.06]">
                <img
                  src={entry.thumbnailDataUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white/15">
                  <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-7.5A2.25 2.25 0 0010.75 4h-7.5zM19 4.75a.75.75 0 00-1.28-.53l-3 3a.75.75 0 00-.22.53v4.5c0 .199.079.39.22.53l3 3A.75.75 0 0019 15.25v-10.5z" />
                </svg>
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-white/70">{entry.fileName}</p>
              <div className="mt-0.5 flex items-center gap-2 text-[10px] text-white/30">
                <span>{timeAgo(entry.createdAt)}</span>
                <span className="text-white/10">·</span>
                <span>{entry.subtitleCount} subs</span>
                {entry.overlayCount > 0 && (
                  <>
                    <span className="text-white/10">·</span>
                    <span>{entry.overlayCount} overlays</span>
                  </>
                )}
                {entry.hasMusic && (
                  <>
                    <span className="text-white/10">·</span>
                    <span>♫</span>
                  </>
                )}
                <span className="text-white/10">·</span>
                <span>{Math.round(entry.duration)}s</span>
              </div>
            </div>

            <button
              onClick={() => handleRemove(entry.id)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white/15 opacity-0 transition hover:bg-white/[0.06] hover:text-white/40 group-hover:opacity-100"
              aria-label="Remove from history"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                <path d="M5.28 4.22a.75.75 0 00-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 101.06 1.06L8 9.06l2.72 2.72a.75.75 0 101.06-1.06L9.06 8l2.72-2.72a.75.75 0 00-1.06-1.06L8 6.94 5.28 4.22z" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {entries.length > 3 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 w-full rounded-lg py-2 text-[11px] font-medium text-white/30 transition hover:bg-white/[0.03] hover:text-white/50"
        >
          {expanded ? "Show less" : `Show all ${entries.length} files`}
        </button>
      )}
    </div>
  );
}
