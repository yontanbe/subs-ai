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
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3dd6c8]/10">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-[#3dd6c8]">
            <path d="M15.836 1.318a1 1 0 01.684.949v13.194a2 2 0 01-.456 1.272l-.17.197A3.001 3.001 0 0112 18.5a3 3 0 01-2.5-4.66V5.307l5-1.39v5.856a3.001 3.001 0 00-3.894 1.727A3 3 0 0013 15.5a3 3 0 002-2.83V2.267a1 1 0 01.836-.949z" />
          </svg>
        </div>
        <h3 className="text-[13px] font-semibold text-white/80">Music</h3>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="chill, upbeat, cinematic…"
          className="input-glass flex-1 rounded-xl px-3 py-2 text-[13px] text-white/80 placeholder:text-white/25"
        />
        <button
          onClick={search}
          disabled={loading || !query}
          className="btn-secondary flex h-[38px] w-[38px] items-center justify-center rounded-xl disabled:opacity-40"
        >
          {loading ? (
            <span className="spinner" style={{ borderTopColor: "#3dd6c8" }} />
          ) : (
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white/50">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {selectedTrack && (
        <div className="rounded-xl border border-[#3dd6c8]/20 bg-[#3dd6c8]/5 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#3dd6c8]/20">
                <span className="text-[10px] text-[#3dd6c8]">♫</span>
              </div>
              <span className="truncate text-[12px] font-medium text-[#3dd6c8]">
                {selectedTrack.title}
              </span>
            </div>
            <button
              onClick={() => onSelect(null)}
              className="rounded-md px-2 py-0.5 text-[10px] text-white/30 transition hover:bg-white/[0.06] hover:text-white/60"
            >
              Remove
            </button>
          </div>
          <VolumeControl volume={musicVolume} onChange={onVolumeChange} />
        </div>
      )}

      {tracks.length > 0 && (
        <div className="max-h-52 space-y-0.5 overflow-y-auto">
          {tracks.map((track) => (
            <div
              key={track.id}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                selectedTrack?.id === track.id
                  ? "bg-[#3dd6c8]/8 border border-[#3dd6c8]/15"
                  : "border border-transparent hover:bg-white/[0.03]"
              }`}
            >
              <button
                onClick={() => togglePreview(track)}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${
                  playingId === track.id
                    ? "bg-[#3dd6c8]/20 text-[#3dd6c8]"
                    : "bg-white/[0.04] text-white/30 hover:text-white/60"
                }`}
              >
                <span className="text-[10px]">
                  {playingId === track.id ? "⏸" : "▶"}
                </span>
              </button>
              <span className="flex-1 truncate text-[12px] text-white/60">
                {track.title}
              </span>
              <button
                onClick={() => onSelect(track)}
                className={`shrink-0 rounded-lg px-3 py-1 text-[10px] font-semibold transition ${
                  selectedTrack?.id === track.id
                    ? "bg-[#3dd6c8]/20 text-[#3dd6c8]"
                    : "bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/70"
                }`}
              >
                {selectedTrack?.id === track.id ? "Selected" : "Use"}
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && tracks.length === 0 && (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-2 text-lg text-white/10">♫</div>
          <p className="text-[11px] text-white/25">
            Search royalty-free music
          </p>
        </div>
      )}
    </div>
  );
}
