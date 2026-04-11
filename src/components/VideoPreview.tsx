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
    <div className="relative w-full overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        playsInline
        className="w-full"
      />
      {currentText && (
        <div className="pointer-events-none absolute inset-x-0 bottom-12 flex justify-center px-4">
          <span
            dir="auto"
            className="inline-block max-w-[90%] rounded px-3 py-1 text-center leading-snug"
            style={{
              fontSize: `${Math.max(14, style.fontSize * 0.45)}px`,
              color: style.primaryColor,
              textShadow: `0 0 4px ${style.outlineColor}, 1px 1px 2px ${style.outlineColor}, -1px -1px 2px ${style.outlineColor}`,
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
