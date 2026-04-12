"use client";

import { useCallback, useRef, useState } from "react";
import type { TranscriptionEngine } from "@/types";

interface Props {
  onVideoSelected: (file: File) => void;
  onTranscribe: (engine: TranscriptionEngine) => void;
  isProcessing: boolean;
}

export default function VideoUploader({
  onVideoSelected,
  onTranscribe,
  isProcessing,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [engine, setEngine] = useState<TranscriptionEngine>("groq");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("video/")) return;
      setFileName(file.name);
      setPreview(URL.createObjectURL(file));
      onVideoSelected(file);
    },
    [onVideoSelected]
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
            MP4, MOV, WebM — under 1 minute
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
      </div>

      {preview && (
        <div className="animate-fade-up space-y-4">
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-black">
            <video
              src={preview}
              controls
              className="w-full"
              playsInline
            />
          </div>
          <p className="truncate font-mono text-[11px] text-white/30">
            {fileName}
          </p>

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
                <option value="groq">Groq Whisper — Free</option>
                <option value="openai">OpenAI Whisper — Paid</option>
              </select>
            </div>
            <button
              onClick={() => onTranscribe(engine)}
              disabled={isProcessing}
              className="btn-glow flex h-[42px] items-center justify-center gap-2 rounded-xl px-6 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {isProcessing && <span className="spinner" />}
              {isProcessing ? "Transcribing…" : "Transcribe"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
