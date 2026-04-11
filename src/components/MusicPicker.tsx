"use client";

import { useRef, useState } from "react";
import type { MusicTrack } from "@/types";
import VolumeControl from "./VolumeControl";

interface Props {
  selectedTrack: MusicTrack | null;
  onSelect: (track: MusicTrack | null) => void;
  musicVolume: number;
  onVolumeChange: (vol: number) => void;
}

export default function MusicPicker({
  selectedTrack,
  onSelect,
  musicVolume,
  onVolumeChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const search = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/music?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setTracks(data.tracks ?? []);
    } catch {
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const togglePreview = (track: MusicTrack) => {
    if (playingId === track.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(track.previewUrl);
    audio.play();
    audio.onended = () => setPlayingId(null);
    audioRef.current = audio;
    setPlayingId(track.id);
  };

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="text-sm font-semibold text-zinc-300">
        Background Music
      </h3>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Search mood: chill, upbeat, cinematic…"
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none"
        />
        <button
          onClick={search}
          disabled={loading || !query}
          className="rounded-lg bg-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-600 disabled:opacity-50"
        >
          {loading ? "…" : "Search"}
        </button>
      </div>

      {selectedTrack && (
        <div className="space-y-2 rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3">
          <div className="flex items-center justify-between">
            <span className="truncate text-xs font-medium text-indigo-300">
              {selectedTrack.title}
            </span>
            <button
              onClick={() => onSelect(null)}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Remove
            </button>
          </div>
          <VolumeControl volume={musicVolume} onChange={onVolumeChange} />
        </div>
      )}

      {tracks.length > 0 && (
        <div className="max-h-48 space-y-1 overflow-y-auto">
          {tracks.map((track) => (
            <div
              key={track.id}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                selectedTrack?.id === track.id
                  ? "bg-indigo-500/10 text-indigo-300"
                  : "text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              <button
                onClick={() => togglePreview(track)}
                className="shrink-0 text-zinc-400 hover:text-white"
              >
                {playingId === track.id ? "⏸" : "▶"}
              </button>
              <span className="flex-1 truncate text-xs">{track.title}</span>
              <button
                onClick={() => onSelect(track)}
                className="shrink-0 rounded bg-zinc-700 px-2 py-0.5 text-[10px] font-medium text-zinc-300 hover:bg-zinc-600"
              >
                {selectedTrack?.id === track.id ? "Selected" : "Use"}
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && tracks.length === 0 && (
        <p className="py-3 text-center text-xs text-zinc-500">
          Search for royalty-free background music (Pixabay)
        </p>
      )}
    </div>
  );
}
