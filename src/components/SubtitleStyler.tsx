"use client";

import type { SubtitleStyle } from "@/types";

interface Props {
  style: SubtitleStyle;
  onChange: (style: SubtitleStyle) => void;
}

const PRESET_COLORS = [
  { hex: "#FFFFFF", name: "White" },
  { hex: "#FFD700", name: "Gold" },
  { hex: "#3dd6c8", name: "Teal" },
  { hex: "#e09145", name: "Amber" },
  { hex: "#FF6B6B", name: "Coral" },
  { hex: "#A78BFA", name: "Violet" },
  { hex: "#34D399", name: "Mint" },
];

const OUTLINE_COLORS = [
  { hex: "#000000", name: "Black" },
  { hex: "#1a1a2e", name: "Navy" },
  { hex: "#2d1b00", name: "Brown" },
  { hex: "#0a1a1a", name: "Dark Teal" },
];

export default function SubtitleStyler({ style, onChange }: Props) {
  return (
    <div className="glass rounded-2xl p-5 space-y-5">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e09145]/10">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-[#e09145]">
            <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
          </svg>
        </div>
        <h3 className="text-[13px] font-semibold text-white/80">
          Subtitle Style
        </h3>
      </div>

      {/* Font Size */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-white/30">
            Size
          </span>
          <span className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[11px] text-[#e09145]">
            {style.fontSize}px
          </span>
        </div>
        <input
          type="range"
          min={16}
          max={72}
          value={style.fontSize}
          onChange={(e) =>
            onChange({ ...style, fontSize: Number(e.target.value) })
          }
          className="w-full"
        />
      </div>

      {/* Primary Color */}
      <div>
        <span className="mb-2.5 block text-[11px] font-medium uppercase tracking-wider text-white/30">
          Text Color
        </span>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.hex}
                title={c.name}
                onClick={() => onChange({ ...style, primaryColor: c.hex })}
                className={`h-7 w-7 rounded-full transition-all duration-200 ${
                  style.primaryColor === c.hex
                    ? "ring-2 ring-[#e09145] ring-offset-2 ring-offset-[#050507] scale-110"
                    : "ring-1 ring-white/10 hover:ring-white/25 hover:scale-105"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
          <div className="relative ml-auto">
            <input
              type="color"
              value={style.primaryColor}
              onChange={(e) =>
                onChange({ ...style, primaryColor: e.target.value })
              }
              className="absolute inset-0 h-7 w-7 cursor-pointer opacity-0"
            />
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-white/20 text-[10px] text-white/40">
              +
            </div>
          </div>
        </div>
      </div>

      {/* Outline Color */}
      <div>
        <span className="mb-2.5 block text-[11px] font-medium uppercase tracking-wider text-white/30">
          Outline
        </span>
        <div className="flex items-center gap-2">
          {OUTLINE_COLORS.map((c) => (
            <button
              key={c.hex}
              title={c.name}
              onClick={() => onChange({ ...style, outlineColor: c.hex })}
              className={`h-7 w-7 rounded-full border transition-all duration-200 ${
                style.outlineColor === c.hex
                  ? "border-[#e09145] ring-2 ring-[#e09145]/30 scale-110"
                  : "border-white/10 hover:border-white/25 hover:scale-105"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
          <div className="relative ml-auto">
            <input
              type="color"
              value={style.outlineColor}
              onChange={(e) =>
                onChange({ ...style, outlineColor: e.target.value })
              }
              className="absolute inset-0 h-7 w-7 cursor-pointer opacity-0"
            />
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-white/20 text-[10px] text-white/40">
              +
            </div>
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div className="flex items-center justify-center rounded-xl border border-white/[0.04] bg-black/40 py-4">
        <span
          dir="auto"
          className="text-center leading-snug"
          style={{
            fontSize: `${Math.max(12, style.fontSize * 0.4)}px`,
            color: style.primaryColor,
            textShadow: `0 0 6px ${style.outlineColor}, 2px 2px 4px ${style.outlineColor}, -1px -1px 3px ${style.outlineColor}`,
            fontFamily: style.fontName,
          }}
        >
          כותרת לדוגמה
        </span>
      </div>
    </div>
  );
}
