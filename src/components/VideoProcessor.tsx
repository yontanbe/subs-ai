"use client";

import { useState } from "react";
import { fetchFile } from "@ffmpeg/util";
import { getFFmpeg } from "@/lib/ffmpeg";
import { generateASS } from "@/lib/srt";
import type {
  ImageOverlay,
  LayoutConfig,
  PipCorner,
  SubtitleSegment,
  SubtitleStyle,
} from "@/types";

interface Props {
  videoFile: File | null;
  segments: SubtitleSegment[];
  style: SubtitleStyle;
  musicUrl: string | null;
  musicVolume: number;
  overlays?: ImageOverlay[];
  secondaryVideoFile?: File | null;
  layoutConfig?: LayoutConfig;
  onExportComplete?: () => void;
}

function pipOverlayCoords(corner: PipCorner): string {
  switch (corner) {
    case "top-left":
      return "10:10";
    case "top-right":
      return "W-w-10:10";
    case "bottom-left":
      return "10:H-h-10";
    case "bottom-right":
    default:
      return "W-w-10:H-h-10";
  }
}

function imageOverlayCoords(position: ImageOverlay["position"]): string {
  switch (position) {
    case "top-left":
      return "10:10";
    case "top-right":
      return "main_w-overlay_w-10:10";
    case "bottom-left":
      return "10:main_h-overlay_h-10";
    case "bottom-right":
      return "main_w-overlay_w-10:main_h-overlay_h-10";
    case "center":
    default:
      return "(main_w-overlay_w)/2:(main_h-overlay_h)/2";
  }
}

/** Returns null when the main stream [0:v] should be used as-is (main-only). */
function buildCombineFilter(layout: LayoutConfig | undefined): string | null {
  const mode = layout?.layout ?? "main-only";

  if (mode === "main-only") {
    return null;
  }

  const defaultRatio = mode === "pip" ? 0.3 : 0.5;
  const r = Math.min(0.7, Math.max(0.3, layout?.ratio ?? defaultRatio));
  const pipRatio = Math.min(0.7, Math.max(0.15, layout?.ratio ?? 0.3));
  const corner = layout?.pipCorner ?? "bottom-right";

  if (mode === "blur-bg") {
    return [
      "[0:v]scale=1280:720:force_original_aspect_ratio=decrease[main]",
      "[0:v]scale=1280:720,boxblur=20:20[bg]",
      "[bg][main]overlay=(W-w)/2:(H-h)/2[vcomb]",
    ].join(";");
  }

  if (mode === "side-by-side") {
    return [
      `[0:v]scale=w=trunc(1280*${r}):h=720:force_original_aspect_ratio=decrease,setsar=1[v0]`,
      `[1:v]scale=w=trunc(1280*${1 - r}):h=720:force_original_aspect_ratio=decrease,setsar=1[v1]`,
      `[v0][v1]hstack=inputs=2[vcomb]`,
    ].join(";");
  }

  if (mode === "split-border") {
    return [
      `[0:v]scale=w=trunc(1280*${r}-2):h=720:force_original_aspect_ratio=decrease,setsar=1[v0]`,
      `[1:v]scale=w=trunc(1280*${1 - r}-2):h=720:force_original_aspect_ratio=decrease,setsar=1[v1]`,
      `[v0][v1]hstack=inputs=2[vcomb]`,
    ].join(";");
  }

  if (mode === "top-bottom") {
    return [
      `[0:v]scale=w=1280:h=trunc(720*${r}):force_original_aspect_ratio=decrease,setsar=1[v0]`,
      `[1:v]scale=w=1280:h=trunc(720*${1 - r}):force_original_aspect_ratio=decrease,setsar=1[v1]`,
      `[v0][v1]vstack=inputs=2[vcomb]`,
    ].join(";");
  }

  // pip
  const xy = pipOverlayCoords(corner);
  return `[0:v][1:v]scale2ref=w=iw*${pipRatio}:h=-2[main][pip];[main][pip]overlay=${xy}[vcomb]`;
}

export default function VideoProcessor({
  videoFile,
  segments,
  style,
  musicUrl,
  musicVolume,
  overlays = [],
  secondaryVideoFile = null,
  layoutConfig,
  onExportComplete,
}: Props) {
  const [progress, setProgress] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!videoFile || segments.length === 0) return;
    setProcessing(true);
    setProgress("Loading FFmpeg…");
    setProgressPct(5);

    try {
      const ffmpeg = await getFFmpeg();

      ffmpeg.on("progress", ({ progress: p }) => {
        const pct = Math.min(95, Math.round(p * 100));
        setProgressPct(pct);
        setProgress(`Burning subtitles… ${pct}%`);
      });

      setProgress("Preparing files…");
      setProgressPct(10);
      const videoData = await fetchFile(videoFile);
      await ffmpeg.writeFile("input.mp4", videoData);

      const assContent = generateASS(segments, style);
      const encoder = new TextEncoder();
      await ffmpeg.writeFile("subs.ass", encoder.encode(assContent));

      const hasSecondary = Boolean(secondaryVideoFile);
      const hasOverlays = overlays.length > 0;

      if (hasSecondary && secondaryVideoFile) {
        setProgress("Loading secondary video…");
        setProgressPct(15);
        const secData = await fetchFile(secondaryVideoFile);
        await ffmpeg.writeFile("secondary.mp4", secData);
      }

      for (let i = 0; i < overlays.length; i++) {
        setProgress(`Downloading overlay ${i + 1}…`);
        const pct = 15 + Math.round((i / Math.max(1, overlays.length)) * 10);
        setProgressPct(pct);
        const imgData = await fetchFile(overlays[i].imageUrl);
        await ffmpeg.writeFile(`overlay_${i}.png`, imgData);
      }

      const cmd: string[] = ["-i", "input.mp4"];
      let nextInput = 1;
      let musicInputIdx: number | null = null;

      if (hasSecondary) {
        cmd.push("-i", "secondary.mp4");
        nextInput += 1;
      }

      if (musicUrl) {
        setProgress("Downloading music…");
        setProgressPct(20);
        const musicData = await fetchFile(musicUrl);
        await ffmpeg.writeFile("music.mp3", musicData);
        musicInputIdx = nextInput;
        cmd.push("-i", "music.mp3");
        nextInput += 1;
      }

      const overlayInputIndices: number[] = [];
      for (let i = 0; i < overlays.length; i++) {
        cmd.push("-loop", "1", "-i", `overlay_${i}.png`);
        overlayInputIndices.push(nextInput);
        nextInput += 1;
      }

      const complexVideo = hasSecondary || hasOverlays;

      if (!complexVideo) {
        if (!musicUrl) {
          cmd.push("-vf", "ass=subs.ass", "-c:a", "copy");
        } else if (musicInputIdx !== null) {
          const vol = (musicVolume / 100).toFixed(2);
          cmd.push(
            "-filter_complex",
            `[${musicInputIdx}:a]volume=${vol}[bg];[0:a][bg]amix=inputs=2:duration=first[outa]`,
            "-map",
            "0:v",
            "-map",
            "[outa]",
            "-vf",
            "ass=subs.ass"
          );
        }
      } else {
        const videoParts: string[] = [];

        const combineFilter = hasSecondary
          ? buildCombineFilter(layoutConfig)
          : null;
        if (combineFilter) {
          videoParts.push(combineFilter);
        }

        let vLabel = combineFilter ? "[vcomb]" : "[0:v]";

        for (let i = 0; i < overlays.length; i++) {
          const o = overlays[i];
          const oIdx = overlayInputIndices[i];
          const scale = Math.min(1, Math.max(0.05, o.scale));
          const start = o.startTime.toFixed(3);
          const end = o.endTime.toFixed(3);
          const pos = imageOverlayCoords(o.position);
          const nextLabel = `[vov${i}]`;

          videoParts.push(
            `${vLabel}[${oIdx}:v]scale2ref=w=iw*${scale}:h=-2[vb${i}][im${i}]`
          );
          videoParts.push(
            `[vb${i}][im${i}]overlay=${pos}:enable=between(t\\,${start}\\,${end})${nextLabel}`
          );
          vLabel = nextLabel;
        }

        videoParts.push(`${vLabel}ass=subs.ass[outv]`);

        let fc = videoParts.join(";");

        if (musicUrl && musicInputIdx !== null) {
          const vol = (musicVolume / 100).toFixed(2);
          fc += `;[${musicInputIdx}:a]volume=${vol}[bg];[0:a][bg]amix=inputs=2:duration=first[outa]`;
          cmd.push("-filter_complex", fc);
          cmd.push("-map", "[outv]", "-map", "[outa]");
        } else {
          cmd.push("-filter_complex", fc);
          cmd.push("-map", "[outv]", "-map", "0:a");
        }
      }

      cmd.push(
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-shortest",
        "output.mp4"
      );

      setProgress("Burning subtitles…");
      setProgressPct(30);
      const run = ffmpeg["exec"].bind(ffmpeg);
      await run(cmd);

      const data = (await ffmpeg.readFile("output.mp4")) as unknown as Uint8Array;
      const blob = new Blob([data.buffer as ArrayBuffer], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setProgress("Complete");
      setProgressPct(100);
      onExportComplete?.();
    } catch (err) {
      setProgress(
        `Error: ${err instanceof Error ? err.message : "Processing failed"}`
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="animate-fade-up space-y-4">
      {/* Export button with progress */}
      <button
        onClick={handleProcess}
        disabled={processing || !videoFile || segments.length === 0}
        className="btn-glow group relative w-full overflow-hidden rounded-2xl py-4 text-[14px] font-semibold text-white disabled:opacity-40"
      >
        {processing && (
          <div
            className="absolute inset-y-0 left-0 bg-white/10 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        )}
        <span className="relative flex items-center justify-center gap-2">
          {processing && <span className="spinner" />}
          {processing ? progress : "Burn Subtitles & Export"}
        </span>
      </button>

      {outputUrl && (
        <div className="animate-fade-up space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="overflow-hidden rounded-xl border border-white/[0.06]">
            <video
              src={outputUrl}
              controls
              playsInline
              className="w-full"
            />
          </div>
          <a
            href={outputUrl}
            download="subtitled-video.mp4"
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#3dd6c8]/30 bg-[#3dd6c8]/5 text-[13px] font-semibold text-[#3dd6c8] transition hover:bg-[#3dd6c8]/10"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
              <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
            </svg>
            Download Video
          </a>
        </div>
      )}
    </div>
  );
}
