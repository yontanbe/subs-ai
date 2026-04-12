"use client";

import { useCallback, useMemo, useRef } from "react";
import type { ImageOverlay, SubtitleSegment } from "@/types";

const TRACK_H = 28;
const GAP = 2;
const PX_PER_SEC = 30;
const MIN_WIDTH = 600;
const RULER_H = 24;
const LABEL_W = "3.5rem";

interface Props {
  videoUrl: string;
  videoDuration: number;
  segments: SubtitleSegment[];
  overlays: ImageOverlay[];
  titleText: string;
  onTitleChange: (title: string) => void;
  titleDuration: number;
  onTitleDurationChange: (d: number) => void;
  onSeek: (time: number) => void;
  currentTime: number;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export default function VideoTimeline({
  videoUrl,
  videoDuration,
  segments,
  overlays,
  titleText,
  onTitleChange,
  titleDuration,
  onTitleDurationChange,
  onSeek,
  currentTime,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { timelineWidth, safeDuration, playheadLeft, titleBarWidth, timeMarkers } =
    useMemo(() => {
      if (videoDuration <= 0) {
        return {
          timelineWidth: MIN_WIDTH,
          safeDuration: 1,
          playheadLeft: 0,
          titleBarWidth: 0,
          timeMarkers: [0],
        };
      }
      const d = videoDuration;
      const w = Math.max(MIN_WIDTH, d * PX_PER_SEC);
      const ph = (clamp(currentTime, 0, d) / d) * w;
      const tw = (clamp(titleDuration, 0, d) / d) * w;
      const lastTick = Math.ceil(d / 5) * 5;
      const markers: number[] = [];
      for (let t = 0; t <= lastTick + 0.001; t += 5) {
        if (t <= d + 1e-6) markers.push(t);
      }
      return {
        timelineWidth: w,
        safeDuration: d,
        playheadLeft: ph,
        titleBarWidth: tw,
        timeMarkers: markers,
      };
    }, [videoDuration, currentTime, titleDuration]);

  const subtitleLayouts = useMemo(() => {
    const d = safeDuration;
    const w = timelineWidth;
    return segments.map((seg, i) => {
      const left = (seg.start / d) * w;
      const width = Math.max(4, ((seg.end - seg.start) / d) * w);
      return { key: `sub-${i}-${seg.start}`, left, width, text: seg.text };
    });
  }, [segments, safeDuration, timelineWidth]);

  const overlayLayouts = useMemo(() => {
    const d = safeDuration;
    const w = timelineWidth;
    return overlays.map((o) => {
      const dur = Math.max(o.endTime - o.startTime, 0.0001);
      const left = (o.startTime / d) * w;
      const width = Math.max(8, (dur / d) * w);
      return { key: o.id, left, width, overlay: o };
    });
  }, [overlays, safeDuration, timelineWidth]);

  const handleSeekClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = scrollRef.current;
      if (!el || videoDuration <= 0) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left + el.scrollLeft;
      const ratio = clamp(x / timelineWidth, 0, 1);
      onSeek(ratio * videoDuration);
    },
    [onSeek, timelineWidth, videoDuration],
  );

  const showTitleTrack = titleText.trim().length > 0;

  const tracksBlockHeight = useMemo(() => {
    let h = RULER_H + GAP;
    if (showTitleTrack) h += TRACK_H + GAP;
    h += TRACK_H + GAP + TRACK_H + GAP + TRACK_H;
    return h;
  }, [showTitleTrack]);

  const gridBg = {
    backgroundImage: [
      "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
      "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
    ].join(","),
    backgroundSize: "24px 24px",
  } as const;

  return (
    <div
      className="glass overflow-hidden rounded-2xl border border-white/[0.08] p-4 transition-all duration-300"
      data-video-url={videoUrl}
    >
      <div
        className="rounded-xl border border-white/[0.06] bg-[#0a0a0c]"
        style={gridBg}
      >
        <div className="flex min-w-0">
          {/* Track labels */}
          <div
            className="flex shrink-0 flex-col border-r border-white/[0.06] bg-black/20 py-2 pl-2 pr-1 text-[10px] font-medium uppercase tracking-wide text-white/35"
            style={{ width: LABEL_W, paddingTop: 8 }}
          >
            <div style={{ height: RULER_H, marginBottom: GAP }} className="flex items-end">
              Time
            </div>
            {showTitleTrack && (
              <div style={{ height: TRACK_H, marginBottom: GAP }} className="flex items-center">
                Title
              </div>
            )}
            <div style={{ height: TRACK_H, marginBottom: GAP }} className="flex items-center">
              Video
            </div>
            <div style={{ height: TRACK_H, marginBottom: GAP }} className="flex items-center">
              Subs
            </div>
            <div style={{ height: TRACK_H }} className="flex items-center">
              Overlay
            </div>
          </div>

          {/* Scrollable timeline */}
          <div
            ref={scrollRef}
            className="relative min-w-0 flex-1 cursor-pointer overflow-x-auto overflow-y-hidden py-2 pr-2 transition-colors"
            onClick={handleSeekClick}
            role="slider"
            aria-valuenow={Math.round(currentTime * 100) / 100}
            aria-valuemin={0}
            aria-valuemax={videoDuration}
            tabIndex={0}
            onKeyDown={(e) => {
              if (videoDuration <= 0) return;
              const step = e.shiftKey ? 5 : 1;
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                onSeek(clamp(currentTime - step, 0, videoDuration));
              } else if (e.key === "ArrowRight") {
                e.preventDefault();
                onSeek(clamp(currentTime + step, 0, videoDuration));
              }
            }}
          >
            <div
              className="relative transition-[width] duration-200 ease-out"
              style={{ width: timelineWidth, minHeight: tracksBlockHeight }}
            >
              {/* Time ruler */}
              <div
                className="relative border-b border-white/[0.06]"
                style={{ height: RULER_H, marginBottom: GAP }}
              >
                {timeMarkers.map((t) => {
                  const left = (t / safeDuration) * timelineWidth;
                  return (
                    <span
                      key={t}
                      className="absolute top-0 text-[10px] tabular-nums text-white/45"
                      style={{ left, transform: "translateX(-2px)" }}
                    >
                      {t}s
                    </span>
                  );
                })}
              </div>

              {/* Title track */}
              {showTitleTrack && (
                <div
                  className="relative rounded-md transition-all duration-200"
                  style={{ height: TRACK_H, marginBottom: GAP }}
                >
                  <div
                    className="absolute top-1/2 h-[22px] -translate-y-1/2 overflow-hidden rounded border border-[#a855f7] bg-[#a855f7]/20 px-1.5 text-[10px] leading-[22px] text-white/90 transition-colors"
                    style={{
                      left: 0,
                      width: titleBarWidth,
                      maxWidth: timelineWidth,
                    }}
                  >
                    <span className="block truncate">{titleText}</span>
                  </div>
                </div>
              )}

              {/* Video track */}
              <div
                className="relative overflow-hidden rounded-md transition-all duration-200"
                style={{ height: TRACK_H, marginBottom: GAP }}
              >
                <div
                  className="absolute inset-0 rounded-md bg-gradient-to-r from-zinc-600/80 via-zinc-500/60 to-zinc-400/50"
                  style={{ width: timelineWidth }}
                />
              </div>

              {/* Subtitle track */}
              <div
                className="relative rounded-md bg-white/[0.02]"
                style={{ height: TRACK_H, marginBottom: GAP }}
              >
                {subtitleLayouts.map((s) => (
                  <div
                    key={s.key}
                    className="absolute top-1/2 h-[20px] -translate-y-1/2 cursor-default overflow-hidden rounded border border-teal-400/50 bg-teal-500/35 transition hover:bg-teal-400/45"
                    style={{ left: s.left, width: s.width }}
                    title={s.text}
                  />
                ))}
              </div>

              {/* Overlay track */}
              <div className="relative rounded-md bg-white/[0.02]" style={{ height: TRACK_H }}>
                {overlayLayouts.map((o) => (
                  <div
                    key={o.key}
                    className="absolute top-1/2 flex h-[22px] -translate-y-1/2 overflow-hidden rounded border border-orange-400/60 bg-orange-500/25 transition hover:border-orange-400/80"
                    style={{ left: o.left, width: o.width }}
                    title={`${o.overlay.startTime.toFixed(1)}s – ${o.overlay.endTime.toFixed(1)}s`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={o.overlay.imageUrl}
                      alt=""
                      className="h-full min-w-[22px] flex-1 object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Playhead */}
              <div
                className="pointer-events-none absolute top-0 z-10 w-0.5 rounded-full bg-gradient-to-b from-orange-400 to-red-500 shadow-[0_0_8px_rgba(251,113,133,0.6)] transition-[left] duration-75 ease-linear"
                style={{
                  left: playheadLeft,
                  height: tracksBlockHeight - RULER_H - GAP,
                  top: RULER_H + GAP,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Title editor */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-1.5">
          <label className="text-[11px] font-medium uppercase tracking-wide text-white/40">
            Title
          </label>
          <input
            type="text"
            className="input-glass w-full rounded-xl px-3 py-2 text-[13px] text-white/90 placeholder:text-white/25 transition"
            placeholder="Add intro title..."
            value={titleText}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        <div className="w-full shrink-0 space-y-1.5 sm:w-48">
          <label className="flex justify-between text-[11px] font-medium uppercase tracking-wide text-white/40">
            <span>Duration</span>
            <span className="tabular-nums text-white/55">{titleDuration}s</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={clamp(titleDuration, 1, 10)}
            onChange={(e) => onTitleDurationChange(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/[0.08] accent-violet-500 transition hover:bg-white/[0.12]"
          />
        </div>
        <div
          className="flex h-[72px] min-w-[140px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] px-3 shadow-inner transition"
          style={{
            background: "linear-gradient(145deg, #1a1a22 0%, #0d0d12 50%, #12121a 100%)",
          }}
        >
          <p className="line-clamp-3 text-center text-[13px] font-medium leading-snug text-white drop-shadow-sm">
            {titleText.trim() || "Preview"}
          </p>
        </div>
      </div>
    </div>
  );
}
