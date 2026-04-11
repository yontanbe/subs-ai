"use client";

import type { SubtitleStyle } from "@/types";

interface Props {
  style: SubtitleStyle;
  onChange: (style: SubtitleStyle) => void;
}

const PRESET_COLORS = [
  "#FFFFFF",
  "#FFD700",
  "#00FF00",
  "#00BFFF",
  "#FF6B6B",
  "#FF69B4",
  "#FFA500",
];

export default function SubtitleStyler({ style, onChange }: Props) {
  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="text-sm font-semibold text-zinc-300">Subtitle Style</h3>

      {/* Font Size */}
      <div>
        <label className="mb-1 flex items-center justify-between text-xs text-zinc-400">
          <span>Font Size</span>
          <span className="font-mono text-zinc-300">{style.fontSize}px</span>
        </label>
        <input
          type="range"
          min={16}
          max={72}
          value={style.fontSize}
          onChange={(e) =>
            onChange({ ...style, fontSize: Number(e.target.value) })
          }
          className="w-full accent-indigo-500"
        />
      </div>

      {/* Primary Color */}
      <div>
        <label className="mb-2 block text-xs text-zinc-400">Text Color</label>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onChange({ ...style, primaryColor: c })}
                className={`h-7 w-7 rounded-full border-2 transition ${
                  style.primaryColor === c
                    ? "border-indigo-400 scale-110"
                    : "border-zinc-700"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input
            type="color"
            value={style.primaryColor}
            onChange={(e) =>
              onChange({ ...style, primaryColor: e.target.value })
            }
            className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent"
          />
        </div>
      </div>

      {/* Outline Color */}
      <div>
        <label className="mb-2 block text-xs text-zinc-400">
          Outline Color
        </label>
        <div className="flex items-center gap-2">
          {["#000000", "#333333", "#1a1a2e", "#0d0d0d"].map((c) => (
            <button
              key={c}
              onClick={() => onChange({ ...style, outlineColor: c })}
              className={`h-7 w-7 rounded-full border-2 transition ${
                style.outlineColor === c
                  ? "border-indigo-400 scale-110"
                  : "border-zinc-600"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={style.outlineColor}
            onChange={(e) =>
              onChange({ ...style, outlineColor: e.target.value })
            }
            className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent"
          />
        </div>
      </div>
    </div>
  );
}
