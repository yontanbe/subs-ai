"use client";

import { useState, useRef, useEffect } from "react";
import { logStep, logError } from "@/lib/clientLog";
import type {
  ImageOverlay,
  LayoutConfig,
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

const API_BASE =
  process.env.NEXT_PUBLIC_TRANSCRIBE_API ||
  "https://reelmix-api-production.up.railway.app";

export default function VideoProcessor({
  videoFile,
  segments,
  style,
  overlays = [],
  onExportComplete,
}: Props) {
  const [progress, setProgress] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleProcess = async () => {
    await logStep("export", "button-clicked", {
      hasVideo: !!videoFile,
      segmentCount: segments.length,
      overlayCount: overlays.length,
      videoSize: videoFile?.size,
      videoType: videoFile?.type,
    });

    if (!videoFile) {
      await logError("export", new Error("No video file"));
      setError("No video file to export");
      return;
    }
    if (segments.length === 0) {
      await logError("export", new Error("No segments"));
      setError("Transcribe the video first before exporting");
      return;
    }

    setProcessing(true);
    setOutputUrl(null);
    setError(null);
    setProgress("Uploading video…");
    setProgressPct(0);

    try {
      const formData = new FormData();
      formData.append("file", videoFile);
      formData.append("segments", JSON.stringify(segments));
      formData.append("style", JSON.stringify(style));
      formData.append("overlays", JSON.stringify(overlays));

      await logStep("export", "starting-upload-v2", {
        apiBase: API_BASE,
        videoSizeMB: (videoFile.size / 1024 / 1024).toFixed(2),
      });

      // ── Phase 1: Upload video + queue job ────────────────────────────────
      // XHR preserves upload progress tracking; fetch does not.
      const { jobId } = await new Promise<{ jobId: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", API_BASE + "/export/submit");
        xhr.setRequestHeader("Accept", "application/json");

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            // Upload = 0–30% of total displayed progress
            setProgressPct(Math.round((e.loaded / e.total) * 30));
          }
        };

        xhr.upload.onload = () => {
          setProgressPct(30);
          setProgress("Queued — encoding on server…");
          logStep("export", "upload-complete-job-queued");
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Invalid server response"));
            }
          } else {
            try {
              reject(new Error(JSON.parse(xhr.responseText).error || "Submit failed"));
            } catch {
              reject(new Error(`Server error ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => reject(new Error("Network error — check your connection"));
        xhr.ontimeout = () => reject(new Error("Upload timed out — try a smaller file"));
        xhr.timeout = 300000; // 5 min for upload only

        xhr.send(formData);
      });

      await logStep("export", "job-submitted", { jobId });

      // ── Phase 2: Poll for status, download when done ──────────────────────
      const blob = await new Promise<Blob>((resolve, reject) => {
        const pollStart = Date.now();

        pollIntervalRef.current = setInterval(async () => {
          try {
            // Client-side safety net: give up after 15 minutes
            if (Date.now() - pollStart > 15 * 60 * 1000) {
              clearInterval(pollIntervalRef.current!);
              pollIntervalRef.current = null;
              reject(new Error("Export timed out after 15 minutes — please try again"));
              return;
            }

            const res = await fetch(`${API_BASE}/export/status/${jobId}`);
            const data = await res.json();

            if (res.status === 404 || data.status === "error") {
              clearInterval(pollIntervalRef.current!);
              pollIntervalRef.current = null;
              await logError("export", new Error(data.error || "Encoding failed"), { jobId });
              reject(new Error(data.error || "Encoding failed"));
              return;
            }

            if (data.status === "done") {
              clearInterval(pollIntervalRef.current!);
              pollIntervalRef.current = null;
              setProgressPct(99);
              setProgress("Downloading…");
              await logStep("export", "encoding-done-downloading", { jobId });

              const dlRes = await fetch(`${API_BASE}/export/download/${jobId}`);
              if (!dlRes.ok) {
                reject(new Error(`Download failed (${dlRes.status})`));
                return;
              }
              resolve(await dlRes.blob());
              return;
            }

            // Still in progress — map server progress (0–100) to display (30–99)
            const displayPct = 30 + Math.round((data.progress / 100) * 69);
            setProgressPct(Math.min(99, displayPct));

            const labels: Record<string, string> = {
              queued: "Queued…",
              uploading: "Preparing video…",
              encoding: "Encoding video…",
            };
            setProgress(labels[data.status] ?? "Processing…");
          } catch {
            // Network hiccup during polling — silently retry next tick
          }
        }, 2000);
      });

      await logStep("export", "got-blob", { size: blob.size, type: blob.type });

      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      await logStep("export", "blob-url-created");
      onExportComplete?.();
    } catch (err) {
      await logError("export", err);
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setProcessing(false);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  };

  return (
    <>
      <div className="animate-fade-up space-y-4">
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
      </div>

      {/* Export modal popup */}
      {(processing || outputUrl || error) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0a0a0f] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-white/95">
                {error ? "Export Failed" : outputUrl ? "Video Ready!" : "Exporting Video"}
              </h3>
              {(outputUrl || error) && (
                <button
                  onClick={() => {
                    setOutputUrl(null);
                    setError(null);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-white/60 transition hover:bg-white/[0.12] hover:text-white"
                >
                  &#x2715;
                </button>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-[13px] text-red-400">
                {error}
              </div>
            )}

            {processing && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-[#e09145]">
                    {progressPct}<span className="text-2xl">%</span>
                  </div>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#e09145] to-[#f0b678] transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-center text-[13px] text-white/60">{progress}</p>
                <p className="text-center text-[11px] text-white/30">
                  Keep this tab open. Processing happens on our server so it works even on iPhone.
                </p>
              </div>
            )}

            {outputUrl && (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-black" style={{ height: "280px" }}>
                  <video src={outputUrl} controls playsInline className="absolute inset-0 w-full h-full" style={{ objectFit: "contain" }} />
                </div>
                <button
                  onClick={async () => {
                    await logStep("download", "button-clicked");
                    try {
                      const response = await fetch(outputUrl);
                      const blob = await response.blob();
                      const fileName = `reelmix-${Date.now()}.mp4`;
                      const file = new File([blob], fileName, { type: "video/mp4" });

                      await logStep("download", "blob-ready", { size: blob.size, canShare: typeof navigator.canShare === "function" });

                      if (
                        typeof navigator.canShare === "function" &&
                        navigator.canShare({ files: [file] })
                      ) {
                        await logStep("download", "using-web-share");
                        await navigator.share({ files: [file], title: "ReelMix video" });
                        return;
                      }

                      await logStep("download", "using-anchor-download");
                      const downloadUrl = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = downloadUrl;
                      a.download = fileName;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
                    } catch (err) {
                      if (err instanceof Error && err.name === "AbortError") {
                        await logStep("download", "user-cancelled");
                        return;
                      }
                      await logError("download", err);
                      window.open(outputUrl, "_blank");
                    }
                  }}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e09145] to-[#d07a2f] text-[15px] font-bold text-white shadow-lg shadow-[#e09145]/30 transition hover:brightness-110 active:scale-[0.98]"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                    <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                    <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                  </svg>
                  Save to Device
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
