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
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition ${
          dragOver
            ? "border-indigo-400 bg-indigo-500/10"
            : "border-zinc-700 hover:border-zinc-500"
        }`}
      >
        <svg
          className="mb-3 h-10 w-10 text-zinc-500"
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
        <p className="text-sm text-zinc-400">
          <span className="font-medium text-indigo-400">Tap to upload</span> or
          drag a video here
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          MP4, MOV, WebM — under 1 minute
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {preview && (
        <div className="space-y-4">
          <video
            src={preview}
            controls
            className="w-full rounded-xl"
            playsInline
          />
          <p className="truncate text-sm text-zinc-400">{fileName}</p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-zinc-400">
                Transcription Engine
              </label>
              <select
                value={engine}
                onChange={(e) =>
                  setEngine(e.target.value as TranscriptionEngine)
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="groq">Groq Whisper (Free)</option>
                <option value="openai">OpenAI Whisper (Paid)</option>
              </select>
            </div>
            <button
              onClick={() => onTranscribe(engine)}
              disabled={isProcessing}
              className="h-10 rounded-lg bg-indigo-500 px-6 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
            >
              {isProcessing ? "Transcribing…" : "Transcribe"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
