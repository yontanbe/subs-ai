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
  const [processing, setProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!videoFile || segments.length === 0) return;
    setProcessing(true);
    setProgress("Loading FFmpeg…");

    try {
      const ffmpeg = await getFFmpeg();

      ffmpeg.on("progress", ({ progress: p }) => {
        setProgress(`Processing: ${Math.round(p * 100)}%`);
      });

      setProgress("Preparing files…");
      const videoData = await fetchFile(videoFile);
      await ffmpeg.writeFile("input.mp4", videoData);

      const assContent = generateASS(segments, style);
      const encoder = new TextEncoder();
      await ffmpeg.writeFile("subs.ass", encoder.encode(assContent));

      const cmd: string[] = ["-i", "input.mp4"];

      if (musicUrl) {
        setProgress("Downloading music…");
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
      const run = ffmpeg["exec"].bind(ffmpeg);
      await run(cmd);

      const data = (await ffmpeg.readFile("output.mp4")) as unknown as Uint8Array;
      const blob = new Blob([data.buffer as ArrayBuffer], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setProgress("Done!");
    } catch (err) {
      setProgress(
        `Error: ${err instanceof Error ? err.message : "Processing failed"}`
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleProcess}
        disabled={processing || !videoFile || segments.length === 0}
        className="w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
      >
        {processing ? progress : "Burn Subtitles & Export"}
      </button>

      {outputUrl && (
        <div className="space-y-3">
          <video
            src={outputUrl}
            controls
            playsInline
            className="w-full rounded-xl"
          />
          <a
            href={outputUrl}
            download="subtitled-video.mp4"
            className="flex h-10 items-center justify-center rounded-lg border border-emerald-600 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-600/10"
          >
            Download Video
          </a>
        </div>
      )}
    </div>
  );
}
