"use client";

import { useEffect, useRef, useState } from "react";
import type { SubtitleSegment, SubtitleStyle } from "@/types";

interface Props {
  videoUrl: string;
  segments: SubtitleSegment[];
  style: SubtitleStyle;
}

export default function VideoPreview({ videoUrl, segments, style }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentText, setCurrentText] = useState("");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTime = () => {
      const t = video.currentTime;
      const seg = segments.find((s) => t >= s.start && t <= s.end);
      setCurrentText(seg?.text ?? "");
    };

    video.addEventListener("timeupdate", onTime);
    return () => video.removeEventListener("timeupdate", onTime);
  }, [segments]);

  return (
    <div className="animate-fade-up relative w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-black shadow-2xl shadow-black/50">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        playsInline
        className="w-full"
      />
      {currentText && (
        <div className="pointer-events-none absolute inset-x-0 bottom-14 flex justify-center px-4">
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
  );
}
