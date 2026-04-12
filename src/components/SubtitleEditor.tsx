"use client";

import type { SubtitleSegment, TargetLanguage } from "@/types";

interface Props {
  segments: SubtitleSegment[];
  onChange: (segments: SubtitleSegment[]) => void;
  onTranslate: (lang: TargetLanguage) => void;
  isTranslating: boolean;
  isTranslated: boolean;
  targetLanguage: TargetLanguage;
  onLanguageChange: (lang: TargetLanguage) => void;
}

const LANGUAGES: { value: TargetLanguage; label: string; flag: string }[] = [
  { value: "original", label: "Original", flag: "🗣️" },
  { value: "he", label: "Hebrew", flag: "🇮🇱" },
  { value: "en", label: "English", flag: "🇺🇸" },
];

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
  targetLanguage,
  onLanguageChange,
}: Props) {
  const updateText = (index: number, text: string) => {
    const updated = [...segments];
    updated[index] = { ...updated[index], text };
    onChange(updated);
  };

  return (
    <div className="animate-fade-up glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-semibold text-white/80">
            Subtitles
          </h3>
          <p className="text-[11px] text-white/30">
            {segments.length} segments detected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                onClick={() => onLanguageChange(lang.value)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all duration-200 ${
                  targetLanguage === lang.value
                    ? "bg-[#3dd6c8]/15 text-[#3dd6c8] shadow-sm"
                    : "text-white/30 hover:text-white/50"
                }`}
              >
                <span className="mr-1">{lang.flag}</span>
                {lang.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => onTranslate(targetLanguage)}
            disabled={isTranslating || segments.length === 0 || targetLanguage === "original"}
            className="flex items-center gap-2 rounded-xl bg-[#3dd6c8]/10 border border-[#3dd6c8]/20 px-4 py-2 text-[12px] font-semibold text-[#3dd6c8] transition hover:bg-[#3dd6c8]/15 disabled:opacity-50"
          >
            {isTranslating && <span className="spinner" style={{ borderTopColor: "#3dd6c8" }} />}
            {isTranslating
              ? "Translating…"
              : isTranslated
                ? "Re-translate"
                : "Translate"}
          </button>
        </div>
      </div>

      <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="group flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 transition hover:border-white/[0.08] hover:bg-white/[0.04]"
          >
            <div className="mt-1 flex shrink-0 flex-col items-center">
              <span className="font-mono text-[10px] text-[#e09145]/60">
                {formatTime(seg.start)}
              </span>
              <div className="my-0.5 h-3 w-px bg-white/10" />
              <span className="font-mono text-[10px] text-white/20">
                {formatTime(seg.end)}
              </span>
            </div>
            <textarea
              value={seg.text}
              onChange={(e) => updateText(i, e.target.value)}
              rows={1}
              dir="auto"
              className="flex-1 resize-none rounded-lg bg-transparent px-1 text-[13px] leading-relaxed text-white/80 placeholder:text-white/20 focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
