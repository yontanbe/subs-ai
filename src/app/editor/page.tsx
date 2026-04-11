"use client";

import { useState } from "react";
import VideoUploader from "@/components/VideoUploader";
import SubtitleEditor from "@/components/SubtitleEditor";
import SubtitleStyler from "@/components/SubtitleStyler";
import VideoPreview from "@/components/VideoPreview";
import VideoProcessor from "@/components/VideoProcessor";
import MediaSuggestions from "@/components/MediaSuggestions";
import MusicPicker from "@/components/MusicPicker";
import type {
  SubtitleSegment,
  SubtitleStyle,
  TranscriptionEngine,
  MediaItem,
  MusicTrack,
} from "@/types";

const DEFAULT_STYLE: SubtitleStyle = {
  fontSize: 28,
  primaryColor: "#FFFFFF",
  outlineColor: "#000000",
  fontName: "Noto Sans Hebrew",
};

export default function EditorPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [segments, setSegments] = useState<SubtitleSegment[]>([]);
  const [style, setStyle] = useState<SubtitleStyle>(DEFAULT_STYLE);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);
  const [musicVolume, setMusicVolume] = useState(15);

  const handleVideoSelected = (file: File) => {
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setSegments([]);
    setIsTranslated(false);
  };

  const handleTranscribe = async (engine: TranscriptionEngine) => {
    if (!videoFile) return;
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("file", videoFile);
      formData.append("engine", engine);

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSegments(data.segments);
      setIsTranslated(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Transcription failed");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTranslate = async () => {
    if (segments.length === 0) return;
    setIsTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSegments(data.segments);
      setIsTranslated(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Translation failed");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleFetchMedia = async (keywords: string) => {
    setMediaLoading(true);
    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: keywords.split(/[,\s]+/).filter(Boolean) }),
      });
      const data = await res.json();
      setMediaItems(data.items ?? []);
    } catch {
      setMediaItems([]);
    } finally {
      setMediaLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-white">Video Editor</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main column */}
        <div className="space-y-6">
          <VideoUploader
            onVideoSelected={handleVideoSelected}
            onTranscribe={handleTranscribe}
            isProcessing={isTranscribing}
          />

          {videoUrl && segments.length > 0 && (
            <VideoPreview
              videoUrl={videoUrl}
              segments={segments}
              style={style}
            />
          )}

          {segments.length > 0 && (
            <SubtitleEditor
              segments={segments}
              onChange={setSegments}
              onTranslate={handleTranslate}
              isTranslating={isTranslating}
              isTranslated={isTranslated}
            />
          )}

          {segments.length > 0 && (
            <VideoProcessor
              videoFile={videoFile}
              segments={segments}
              style={style}
              musicUrl={selectedTrack?.url ?? null}
              musicVolume={musicVolume}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SubtitleStyler style={style} onChange={setStyle} />

          <MusicPicker
            selectedTrack={selectedTrack}
            onSelect={setSelectedTrack}
            musicVolume={musicVolume}
            onVolumeChange={setMusicVolume}
          />

          <MediaSuggestions
            items={mediaItems}
            isLoading={mediaLoading}
            onFetch={handleFetchMedia}
          />
        </div>
      </div>
    </div>
  );
}
