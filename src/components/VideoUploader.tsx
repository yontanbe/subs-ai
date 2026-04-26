"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import type { TranscriptionEngine } from "@/types";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

interface Props {
  onVideoSelected: (file: File) => void;
  onTranscribe: (engine: TranscriptionEngine) => void;
  isProcessing: boolean;
  statusMessage?: string;
  uploadProgress?: number;
}

export default function VideoUploader({
  onVideoSelected,
  onTranscribe,
  isProcessing,
  statusMessage,
  uploadProgress,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [sizeWarning, setSizeWarning] = useState<string>("");
  const [engine, setEngine] = useState<TranscriptionEngine>("openai");
  const [dragOver, setDragOver] = useState(false);

  // Revoke object URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / 1024).toFixed(0) + " KB";
  };

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("video/")) return;

      // Revoke previous preview URL
      if (preview) URL.revokeObjectURL(preview);

      // File size validation
      if (file.size > MAX_FILE_SIZE) {
        setSizeWarning(`File is ${formatSize(file.size)} — max is 500 MB. Try trimming the video first.`);
        return;
      }
      setSizeWarning(file.size > 100 * 1024 * 1024
        ? `Large file (${formatSize(file.size)}) — upload may take a moment`
        : "");

      setFileName(file.name);
      setFileSize(formatSize(file.size));
      setPreview(URL.createObjectURL(file));
      onVideoSelected(file);
    },
    [onVideoSelected, preview]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // Determine step from statusMessage
  const step = statusMessage?.includes("Uploading")
    ? 1
    : statusMessage?.includes("Extracting") || statusMessage?.includes("Processing")
      ? 2
      : statusMessage?.includes("Transcribing")
        ? 3
        : 0;

  return (
    <div className="animate-fade-up space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed p-10 transition-all duration-300 ${
          dragOver
            ? "border-[#e09145] bg-[#e09145]/5 scale-[1.01]"
            : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
        }`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-b from-[#e09145]/5 to-transparent opacity-0 transition-opacity duration-300 ${
            dragOver ? "opacity-100" : "group-hover:opacity-60"
          }`}
        />
        <div className="relative flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] transition-transform duration-300 group-hover:scale-105">
            <svg
              className="h-6 w-6 text-white/40 transition-colors group-hover:text-[#e09145]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>
          <p className="text-[13px] text-white/50">
            <span className="font-medium text-[#e09145]">Tap to upload</span>{" "}
            or drag a video here
          </p>
          <p className="mt-1.5 text-[11px] text-white/25">
            MP4, MOV, WebM — works with phone videos too
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="video/*,video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
      </div>

      {sizeWarning && !preview && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-[13px] text-red-400">
          {sizeWarning}
        </div>
      )}

      {preview && (
        <div className="animate-fade-up space-y-4">
          {/* Video preview — fixed-height container, video fits inside regardless of format */}
          <div className="relative mx-auto w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-black shadow-2xl" style={{ height: "320px" }}>
            <video
              src={preview}
              controls
              playsInline
              className="absolute inset-0 w-full h-full"
              style={{ objectFit: "contain" }}
            />
          </div>

          {/* File info */}
          <div className="flex items-center justify-center gap-3 text-[11px] text-white/30">
            <span className="truncate max-w-[200px] font-mono">{fileName}</span>
            <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-white/40">{fileSize}</span>
          </div>

          {sizeWarning && (
            <p className="text-center text-[12px] text-amber-400/70">{sizeWarning}</p>
          )}

          {/* Full-screen processing modal */}
          {isProcessing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
              <div className="w-full max-w-lg rounded-3xl border border-white/[0.08] bg-[#0a0a0f] p-8 shadow-2xl">
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#e09145] to-[#d07a2f] shadow-lg shadow-[#e09145]/40">
                    <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
                  </div>
                  <h2 className="text-2xl font-bold text-white/95">
                    {step === 1 ? "Uploading Video" : step === 2 ? "Extracting Audio" : "Transcribing with AI"}
                  </h2>
                  <p className="mt-2 text-[14px] text-white/50">
                    {step === 1 ? "Sending your video to the server" : step === 2 ? "Converting audio for AI processing" : "Generating subtitles, this may take a minute"}
                  </p>
                </div>

                {/* Big progress percentage */}
                {step === 1 && uploadProgress !== undefined && (
                  <div className="mb-6 text-center">
                    <div className="text-5xl font-bold text-[#e09145]">{uploadProgress}<span className="text-2xl">%</span></div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-bold transition-all ${step >= 1 ? "bg-[#e09145] text-white shadow-lg shadow-[#e09145]/30" : "bg-white/[0.06] text-white/30"}`}>
                      {step > 1 ? "\u2713" : "1"}
                    </div>
                    <div className="flex-1">
                      <p className={`text-[15px] font-semibold ${step === 1 ? "text-white/95" : step > 1 ? "text-white/40" : "text-white/25"}`}>
                        Upload video
                      </p>
                      {step === 1 && uploadProgress !== undefined && (
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#e09145] to-[#f0b678] transition-all duration-500"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                      {step > 1 && <p className="mt-0.5 text-[12px] text-white/40">Complete</p>}
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-bold transition-all ${step >= 2 ? "bg-[#e09145] text-white shadow-lg shadow-[#e09145]/30" : "bg-white/[0.06] text-white/30"}`}>
                      {step > 2 ? "\u2713" : "2"}
                    </div>
                    <div className="flex-1">
                      <p className={`text-[15px] font-semibold ${step === 2 ? "text-white/95" : step > 2 ? "text-white/40" : "text-white/25"}`}>
                        Extract audio
                      </p>
                      {step === 2 && (
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                          <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-[#e09145]/60 to-[#f0b678]/60" />
                        </div>
                      )}
                      {step > 2 && <p className="mt-0.5 text-[12px] text-white/40">Complete</p>}
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-bold transition-all ${step >= 3 ? "bg-[#e09145] text-white shadow-lg shadow-[#e09145]/30" : "bg-white/[0.06] text-white/30"}`}>
                      {step > 3 ? "\u2713" : "3"}
                    </div>
                    <div className="flex-1">
                      <p className={`text-[15px] font-semibold ${step === 3 ? "text-white/95" : step > 3 ? "text-white/40" : "text-white/25"}`}>
                        AI Transcription
                      </p>
                      {step === 3 && (
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                          <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-[#e09145]/60 to-[#f0b678]/60" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-center text-[11px] text-white/25">
                  Please keep this tab open while processing
                </p>
              </div>
            </div>
          )}

          {/* Engine selector + button — hidden while processing */}
          {!isProcessing && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/30">
                  Engine
                </label>
                <select
                  value={engine}
                  onChange={(e) =>
                    setEngine(e.target.value as TranscriptionEngine)
                  }
                  className="input-glass w-full rounded-xl px-3 py-2.5 text-[13px] text-white/80"
                >
                  <option value="openai">OpenAI Whisper — Best quality ($0.006/min)</option>
                  <option value="groq">Groq Whisper — Free (lower quality)</option>
                </select>
              </div>
              <button
                onClick={() => onTranscribe(engine)}
                className="btn-glow flex h-[42px] items-center justify-center gap-2 rounded-xl px-6 text-[13px] font-semibold text-white"
              >
                Transcribe
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
