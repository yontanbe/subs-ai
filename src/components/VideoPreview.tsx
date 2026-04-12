"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import SafeZoneOverlay from "@/components/SafeZoneOverlay";
import type {
  ImageOverlay,
  OverlayAnimation,
  SafeZonePlatform,
  SubtitleSegment,
  SubtitleStyle,
} from "@/types";

export interface VideoPreviewHandle {
  seek: (time: number) => void;
  getCurrentTime: () => number;
}

interface Props {
  videoUrl: string;
  segments: SubtitleSegment[];
  style: SubtitleStyle;
  overlays?: ImageOverlay[];
  safeZonePlatform?: SafeZonePlatform;
  showSafeZones?: boolean;
  onTimeUpdate?: (time: number) => void;
}

const ANIMATION_CLASS: Record<Exclude<OverlayAnimation, "none">, string> = {
  "fade-in": "overlay-fade-in",
  "slide-left": "overlay-slide-left",
  "slide-right": "overlay-slide-right",
  "slide-up": "overlay-slide-up",
  zoom: "overlay-zoom",
};

function overlayAnimationClass(animation: OverlayAnimation): string | undefined {
  if (animation === "none") return undefined;
  return ANIMATION_CLASS[animation];
}

function overlayPositionClass(position: ImageOverlay["position"]): string {
  switch (position) {
    case "top-left":
      return "absolute top-4 left-4";
    case "top-right":
      return "absolute top-4 right-4";
    case "bottom-left":
      return "absolute bottom-20 left-4";
    case "bottom-right":
      return "absolute bottom-20 right-4";
    case "center":
      return "absolute inset-0 flex items-center justify-center";
    default:
      return "";
  }
}

const VideoPreview = forwardRef<VideoPreviewHandle, Props>(function VideoPreview({
  videoUrl,
  segments,
  style,
  overlays = [],
  safeZonePlatform,
  showSafeZones = false,
  onTimeUpdate,
}, ref) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentText, setCurrentText] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [safeZonesVisible, setSafeZonesVisible] = useState(false);
  const [platform, setPlatform] = useState<SafeZonePlatform>(
    safeZonePlatform ?? "instagram"
  );

  useImperativeHandle(ref, () => ({
    seek(time: number) {
      const video = videoRef.current;
      if (video) video.currentTime = time;
    },
    getCurrentTime() {
      return videoRef.current?.currentTime ?? 0;
    },
  }));

  useEffect(() => {
    if (safeZonePlatform) setPlatform(safeZonePlatform);
  }, [safeZonePlatform]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTime = () => {
      const t = video.currentTime;
      setCurrentTime(t);
      onTimeUpdate?.(t);
      const seg = segments.find((s) => t >= s.start && t <= s.end);
      setCurrentText(seg?.text ?? "");
    };

    video.addEventListener("timeupdate", onTime);
    return () => video.removeEventListener("timeupdate", onTime);
  }, [segments, onTimeUpdate]);

  const activeOverlays = overlays.filter(
    (o) => currentTime >= o.startTime && currentTime <= o.endTime
  );

  const showSafeZoneOverlay = showSafeZones && safeZonesVisible;

  return (
    <div className="animate-fade-up relative w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-black shadow-2xl shadow-black/50">
      {showSafeZones && (
        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] bg-white/[0.03] px-3 py-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-white/40">
            Safe zones
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPlatform("instagram")}
              className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
                platform === "instagram"
                  ? "bg-[#E1306C]/25 text-[#E1306C]"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
              }`}
            >
              IG
            </button>
            <button
              type="button"
              onClick={() => setPlatform("tiktok")}
              className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
                platform === "tiktok"
                  ? "bg-[#00f2ea]/20 text-[#00f2ea]"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
              }`}
            >
              TT
            </button>
            <button
              type="button"
              onClick={() => setPlatform("youtube")}
              className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
                platform === "youtube"
                  ? "bg-[#FF0000]/25 text-[#FF0000]"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
              }`}
            >
              YT
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSafeZonesVisible((v) => !v)}
            className={`ml-auto rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
              safeZonesVisible
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            {safeZonesVisible ? "Hide guides" : "Show guides"}
          </button>
        </div>
      )}

      <div className="relative">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          playsInline
          className="w-full"
        />

        {showSafeZoneOverlay && (
          <SafeZoneOverlay platform={platform} visible />
        )}

        {activeOverlays.map((overlay) => {
          const anim = overlayAnimationClass(overlay.animation);
          const pos = overlayPositionClass(overlay.position);

          return (
            <div
              key={overlay.id}
              className={`pointer-events-none z-[5] ${pos} ${anim ?? ""}`}
            >
              <div style={{ transform: `scale(${overlay.scale})` }}>
                <img
                  src={overlay.imageUrl}
                  alt=""
                  className="max-h-[30%] max-w-[30%] object-contain"
                />
              </div>
            </div>
          );
        })}

        {currentText && (
          <div className="pointer-events-none absolute inset-x-0 bottom-14 z-[6] flex justify-center px-4">
            <span
              dir="auto"
              className="inline-block max-w-[90%] rounded-lg bg-black/30 px-4 py-1.5 text-center leading-snug backdrop-blur-sm transition-all duration-200"
              style={{
                fontSize: `${Math.max(14, style.fontSize * 0.45)}px`,
                color: style.primaryColor,
                textShadow: `0 0 8px ${style.outlineColor}, 2px 2px 4px ${style.outlineColor}, -2px -2px 4px ${style.outlineColor}`,
                fontFamily: style.fontName,
              }}
            >
              {currentText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

export default VideoPreview;
