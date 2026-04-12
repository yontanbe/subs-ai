"use client";

import { useState } from "react";
import type { ImageOverlay, OverlayAnimation, OverlayPosition } from "@/types";

const POSITIONS: OverlayPosition[] = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "center",
];

const ANIMATIONS: OverlayAnimation[] = [
  "none",
  "fade-in",
  "slide-left",
  "slide-right",
  "slide-up",
  "zoom",
];

function formatPosition(p: OverlayPosition): string {
  return p.replace("-", " ");
}

function formatAnimation(a: OverlayAnimation): string {
  return a === "none" ? "none" : a.replace("-", " ");
}

interface Props {
  overlays: ImageOverlay[];
  onChange: (overlays: ImageOverlay[]) => void;
  mediaSuggestions?: string[];
  videoDuration: number;
}

export default function ImageOverlayEditor({
  overlays,
  onChange,
  mediaSuggestions,
  videoDuration,
}: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [newUrl, setNewUrl] = useState("");

  const updateOverlay = (id: string, patch: Partial<ImageOverlay>) => {
    onChange(
      overlays.map((o) => (o.id === id ? { ...o, ...patch } : o))
    );
  };

  const removeOverlay = (id: string) => {
    onChange(overlays.filter((o) => o.id !== id));
  };

  const addOverlay = () => {
    const url = newUrl.trim();
    if (!url) return;
    const end = Math.min(videoDuration, 5);
    const overlay: ImageOverlay = {
      id: crypto.randomUUID(),
      imageUrl: url,
      position: "bottom-right",
      animation: "fade-in",
      startTime: 0,
      endTime: end,
      scale: 0.3,
    };
    onChange([...overlays, overlay]);
    setNewUrl("");
    setShowAdd(false);
  };

  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5 text-cyan-400"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909-4.97-4.969a.75.75 0 00-1.06 0L2.5 11.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-[13px] font-semibold text-white/80">
          Image Overlays
        </h3>
      </div>

      <div className="space-y-3">
        {overlays.length === 0 ? (
          <p className="text-[12px] text-white/35">
            No overlays yet. Add an image URL to place graphics on your video.
          </p>
        ) : (
          overlays.map((o) => (
            <div
              key={o.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-3"
            >
              <div className="flex gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={o.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="mb-1 block text-[10px] uppercase tracking-wide text-white/35">
                        Position
                      </span>
                      <select
                        value={o.position}
                        onChange={(e) =>
                          updateOverlay(o.id, {
                            position: e.target.value as OverlayPosition,
                          })
                        }
                        className="input-glass w-full rounded-lg px-2 py-1.5 text-[12px] text-white/80"
                      >
                        {POSITIONS.map((p) => (
                          <option key={p} value={p}>
                            {formatPosition(p)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[10px] uppercase tracking-wide text-white/35">
                        Animation
                      </span>
                      <select
                        value={o.animation}
                        onChange={(e) =>
                          updateOverlay(o.id, {
                            animation: e.target.value as OverlayAnimation,
                          })
                        }
                        className="input-glass w-full rounded-lg px-2 py-1.5 text-[12px] text-white/80"
                      >
                        {ANIMATIONS.map((a) => (
                          <option key={a} value={a}>
                            {formatAnimation(a)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="mb-1 block text-[10px] uppercase tracking-wide text-white/35">
                        Start (s)
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={o.startTime}
                        onChange={(e) =>
                          updateOverlay(o.id, {
                            startTime: Number(e.target.value) || 0,
                          })
                        }
                        className="input-glass w-full rounded-lg px-2 py-1.5 text-[12px] text-white/80"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[10px] uppercase tracking-wide text-white/35">
                        End (s)
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={o.endTime}
                        onChange={(e) =>
                          updateOverlay(o.id, {
                            endTime: Number(e.target.value) || 0,
                          })
                        }
                        className="input-glass w-full rounded-lg px-2 py-1.5 text-[12px] text-white/80"
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="mb-1 flex justify-between text-[10px] uppercase tracking-wide text-white/35">
                      <span>Scale</span>
                      <span className="normal-case text-white/50">
                        {o.scale.toFixed(2)}
                      </span>
                    </span>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={o.scale}
                      onChange={(e) =>
                        updateOverlay(o.id, {
                          scale: Number(e.target.value),
                        })
                      }
                      className="w-full accent-cyan-500"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => removeOverlay(o.id)}
                  className="btn-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  aria-label="Remove overlay"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 text-white/45"
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAdd ? (
        <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addOverlay()}
            placeholder="Paste image URL…"
            className="input-glass w-full rounded-xl px-3 py-2 text-[13px] text-white/80 placeholder:text-white/25"
          />
          {mediaSuggestions && mediaSuggestions.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {mediaSuggestions.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setNewUrl(u)}
                  className="max-w-full truncate rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[10px] text-white/45 transition hover:text-white/70"
                >
                  {u.slice(0, 36)}
                  {u.length > 36 ? "…" : ""}
                </button>
              ))}
            </div>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addOverlay}
              disabled={!newUrl.trim()}
              className="btn-secondary rounded-xl px-4 py-2 text-[12px] font-medium text-white/70 disabled:opacity-40"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAdd(false);
                setNewUrl("");
              }}
              className="btn-secondary rounded-xl px-4 py-2 text-[12px] font-medium text-white/50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="btn-secondary w-full rounded-xl border border-dashed border-white/[0.08] py-3 text-[13px] font-medium text-white/45 transition hover:text-white/65"
        >
          + Add Overlay
        </button>
      )}
    </div>
  );
}
