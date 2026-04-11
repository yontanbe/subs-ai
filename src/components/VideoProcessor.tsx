"use client";

import { useState } from "react";
import { fetchFile } from "@ffmpeg/util";
import { getFFmpeg } from "@/lib/ffmpeg";
import { generateASS } from "@/lib/srt";
import type { SubtitleSegment, SubtitleStyle } from "@/types";

interface Props {
  videoFile: File | null;
  segments: SubtitleSegment[];
  style: SubtitleStyle;
  musicUrl: string | null;
  musicVolume: number;
}

export default function VideoProcessor({
  videoFile,
  segments,
  style,
  musicUrl,
  musicVolume,
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

      const cmd: string[] = ["-i", "input.mp4"];

      if (musicUrl) {
        setProgress("Downloading music…");
        setProgressPct(20);
        const musicData = await fetchFile(musicUrl);
        await ffmpeg.writeFile("music.mp3", musicData);
        cmd.push("-i", "music.mp3");
      }

      const vf = "ass=subs.ass";

      if (musicUrl) {
        const vol = (musicVolume / 100).toFixed(2);
        cmd.push(
          "-filter_complex",
          `[1:a]volume=${vol}[bg];[0:a][bg]amix=inputs=2:duration=first[outa]`,
          "-map", "0:v",
          "-map", "[outa]",
          "-vf", vf
        );
      } else {
        cmd.push("-vf", vf, "-c:a", "copy");
      }

      cmd.push(
        "-c:v", "libx264",
        "-preset", "ultrafast",
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
