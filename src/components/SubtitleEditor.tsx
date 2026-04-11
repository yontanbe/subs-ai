"use client";

import type { SubtitleSegment } from "@/types";

interface Props {
  segments: SubtitleSegment[];
  onChange: (segments: SubtitleSegment[]) => void;
  onTranslate: () => void;
  isTranslating: boolean;
  isTranslated: boolean;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function SubtitleEditor({
  segments,
  onChange,
  onTranslate,
  isTranslating,
  isTranslated,
}: Props) {
  const updateText = (index: number, text: string) => {
    const updated = [...segments];
    updated[index] = { ...updated[index], text };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-300">
          Subtitles ({segments.length} segments)
        </h3>
        <button
          onClick={onTranslate}
          disabled={isTranslating || segments.length === 0}
          className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
        >
          {isTranslating
            ? "Translating…"
            : isTranslated
              ? "Re-translate to Hebrew"
              : "Translate to Hebrew"}
        </button>
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-2"
          >
            <span className="mt-1.5 shrink-0 text-[10px] font-mono text-zinc-500">
              {formatTime(seg.start)}–{formatTime(seg.end)}
            </span>
            <textarea
              value={seg.text}
              onChange={(e) => updateText(i, e.target.value)}
              rows={1}
              dir="auto"
              className="flex-1 resize-none rounded bg-transparent px-1 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
