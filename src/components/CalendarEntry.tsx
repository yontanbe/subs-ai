"use client";

import type { CalendarEntry as CalendarEntryType } from "@/types";

const PLATFORM_STYLES: Record<string, { bg: string; label: string }> = {
  instagram: { bg: "bg-pink-500/20 text-pink-300", label: "IG" },
  tiktok: { bg: "bg-zinc-600/30 text-zinc-300", label: "TT" },
  youtube: { bg: "bg-red-500/20 text-red-300", label: "YT" },
};

interface Props {
  entry: CalendarEntryType;
  onDelete: (id: string) => void;
}

export default function CalendarEntryCard({ entry, onDelete }: Props) {
  const platformStyle = PLATFORM_STYLES[entry.platform] ?? PLATFORM_STYLES.youtube;

  return (
    <div className="group flex items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 p-2">
      <span
        className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${platformStyle.bg}`}
      >
        {platformStyle.label}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-zinc-200">
          {entry.title}
        </p>
        {entry.description && (
          <p className="truncate text-[10px] text-zinc-500">
            {entry.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onDelete(entry.id)}
        className="shrink-0 opacity-0 transition group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-xs"
      >
        ✕
      </button>
    </div>
  );
}
