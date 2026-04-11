"use client";

import type { CalendarEntry as CalendarEntryType } from "@/types";

const PLATFORM_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  instagram: { bg: "bg-pink-500/15", text: "text-pink-400", label: "IG" },
  tiktok: { bg: "bg-white/[0.06]", text: "text-white/50", label: "TT" },
  youtube: { bg: "bg-red-500/15", text: "text-red-400", label: "YT" },
};

interface Props {
  entry: CalendarEntryType;
  onDelete: (id: string) => void;
}

export default function CalendarEntryCard({ entry, onDelete }: Props) {
  const ps = PLATFORM_STYLES[entry.platform] ?? PLATFORM_STYLES.youtube;

  return (
    <div className="group flex items-center gap-1.5 rounded-md bg-white/[0.03] px-1.5 py-1 transition hover:bg-white/[0.06]">
      <span
        className={`shrink-0 rounded px-1 py-px text-[8px] font-bold uppercase ${ps.bg} ${ps.text}`}
      >
        {ps.label}
      </span>
      <span className="min-w-0 flex-1 truncate text-[10px] text-white/60">
        {entry.title}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(entry.id);
        }}
        className="shrink-0 text-[10px] text-transparent transition group-hover:text-white/20 hover:!text-red-400"
      >
        ×
      </button>
    </div>
  );
}
