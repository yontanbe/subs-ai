"use client";

import { useState, useCallback, useRef } from "react";
import VideoUploader from "@/components/VideoUploader";
import SubtitleEditor from "@/components/SubtitleEditor";
import SubtitleStyler from "@/components/SubtitleStyler";
import VideoPreview, { type VideoPreviewHandle } from "@/components/VideoPreview";
import VideoProcessor from "@/components/VideoProcessor";
import MediaSuggestions from "@/components/MediaSuggestions";
import MusicPicker from "@/components/MusicPicker";
import ImageOverlayEditor from "@/components/ImageOverlayEditor";
import YouTubeImporter from "@/components/YouTubeImporter";
import LayoutPicker from "@/components/LayoutPicker";
import VideoTimeline from "@/components/VideoTimeline";
import AIModelSettings from "@/components/AIModelSettings";
import FileHistory from "@/components/FileHistory";
import { addHistoryEntry, captureThumbnail } from "@/lib/history";
import type {
  SubtitleSegment,
  SubtitleStyle,
  TranscriptionEngine,
  MediaItem,
  MusicTrack,
  TargetLanguage,
  ImageOverlay,
  LayoutConfig,
  OverlayPosition,
  OverlayAnimation,
  AIModelConfig,
  LLMProvider,
} from "@/types";

const DEFAULT_STYLE: SubtitleStyle = {
  fontSize: 52,
  primaryColor: "#FFFFFF",
  outlineColor: "#000000",
  fontName: "Noto Sans Hebrew",
};

const DEFAULT_LAYOUT: LayoutConfig = {
  layout: "main-only",
  pipCorner: "bottom-right",
  ratio: 0.5,
};

const DEFAULT_AI_CONFIG: AIModelConfig = {
  transcription: "groq",
  translation: "gemini",
  keywordExtraction: "gemini",
};

type EditorStep = "upload" | "edit" | "export";

const STEP_META: { id: EditorStep; label: string; num: number }[] = [
  { id: "upload", label: "Upload & Transcribe", num: 1 },
  { id: "edit", label: "Edit & Enhance", num: 2 },
  { id: "export", label: "Export", num: 3 },
];

export default function EditorPage() {
  const previewRef = useRef<VideoPreviewHandle>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [segments, setSegments] = useState<SubtitleSegment[]>([]);
  const [style, setStyle] = useState<SubtitleStyle>(DEFAULT_STYLE);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeStatus, setTranscribeStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>("he");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);
  const [musicVolume, setMusicVolume] = useState(15);
  const [overlays, setOverlays] = useState<ImageOverlay[]>([]);
  const [secondaryVideoFile, setSecondaryVideoFile] = useState<File | null>(null);
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(DEFAULT_LAYOUT);
  const [isGeneratingOverlays, setIsGeneratingOverlays] = useState(false);
  const [overlayProgress, setOverlayProgress] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [titleText, setTitleText] = useState("");
  const [titleDuration, setTitleDuration] = useState(3);
  const [aiConfig, setAIConfig] = useState<AIModelConfig>(DEFAULT_AI_CONFIG);
  const [historyKey, setHistoryKey] = useState(0);

  const handleExportComplete = useCallback(async () => {
    const thumb = videoUrl ? await captureThumbnail(videoUrl) : undefined;
    addHistoryEntry({
      id: crypto.randomUUID(),
      fileName: videoFile?.name ?? "video",
      createdAt: new Date().toISOString(),
      duration: videoDuration,
      subtitleCount: segments.length,
      overlayCount: overlays.length,
      language: targetLanguage,
      hasMusic: !!selectedTrack,
      thumbnailDataUrl: thumb,
    });
    setHistoryKey((k) => k + 1);
  }, [videoFile, videoUrl, videoDuration, segments, overlays, targetLanguage, selectedTrack]);

  const activeStep: EditorStep =
    !videoFile || (segments.length === 0 && !isTranscribing)
      ? "upload"
      : "edit";

  const handleResetToUpload = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoFile(null);
    setVideoUrl("");
    setVideoDuration(0);
    setSegments([]);
    setIsTranslated(false);
    setOverlays([]);
    setSecondaryVideoFile(null);
    setLayoutConfig(DEFAULT_LAYOUT);
    setTitleText("");
    setTitleDuration(3);
    setCurrentTime(0);
    setOverlayProgress("");
    setMediaItems([]);
    setSelectedTrack(null);
  };

  const [sidebarTab, setSidebarTab] = useState<"style" | "media" | "layout" | "ai">("style");

  const handleVideoSelected = (file: File) => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setSegments([]);
    setIsTranslated(false);
    setOverlays([]);
    setSecondaryVideoFile(null);
    setLayoutConfig(DEFAULT_LAYOUT);
    setTitleText("");
    setTitleDuration(3);
    setCurrentTime(0);
    setOverlayProgress("");
    setMediaItems([]);

    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      setVideoDuration(probe.duration);
      URL.revokeObjectURL(probe.src);
    };
    probe.src = URL.createObjectURL(file);
  };

  const runAutoOverlayPipeline = async (segs: SubtitleSegment[]) => {
    setIsGeneratingOverlays(true);
    setOverlayProgress("Analyzing video content...");

    try {
      setOverlayProgress("Extracting visual keywords...");
      const kwRes = await fetch("/api/extract-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments: segs, provider: aiConfig.keywordExtraction }),
      });
      const kwData = await kwRes.json();
      if (kwData.error || !kwData.keywords?.length) {
        setOverlayProgress("");
        return;
      }

      const keywords: { keyword: string; startTime: number; endTime: number }[] =
        kwData.keywords;

      const newOverlays: ImageOverlay[] = [];
      const positions: OverlayPosition[] = [
        "bottom-right",
        "bottom-left",
        "top-right",
        "top-left",
        "center",
      ];
      const animations: OverlayAnimation[] = [
        "fade-in",
        "slide-up",
        "zoom",
        "slide-left",
        "slide-right",
      ];

      for (let i = 0; i < keywords.length; i++) {
        const kw = keywords[i];
        setOverlayProgress(
          `Fetching media for "${kw.keyword}"... (${i + 1}/${keywords.length})`,
        );

        let items: MediaItem[] = [];

        try {
          const mediaRes = await fetch("/api/keywords", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keywords: [kw.keyword] }),
          });
          if (mediaRes.ok) {
            const mediaData = await mediaRes.json();
            items = mediaData.items ?? [];
          }
        } catch { /* network error */ }

        // Retry with simpler keyword if no results
        if (items.length === 0) {
          try {
            const simpleKw = kw.keyword.split(/\s+/)[0];
            const retryRes = await fetch("/api/keywords", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ keywords: [simpleKw] }),
            });
            if (retryRes.ok) {
              const retryData = await retryRes.json();
              items = retryData.items ?? [];
            }
          } catch { /* skip */ }
        }

        const preferGif = i % 2 === 1;
        const mediaItem = preferGif
          ? items.find((m) => m.type === "gif") || items.find((m) => m.type === "image")
          : items.find((m) => m.type === "image") || items.find((m) => m.type === "gif");

        if (mediaItem) {
          const pos = positions[i % positions.length];
          const duration = kw.endTime - kw.startTime;
          const adjustedEnd = duration < 1.5 ? kw.startTime + 1.5 : kw.endTime;
          const overlayScale = pos === "center" ? 0.4 : 0.25;
          newOverlays.push({
            id: crypto.randomUUID(),
            imageUrl: mediaItem.url,
            position: pos,
            animation: animations[i % animations.length],
            startTime: kw.startTime,
            endTime: adjustedEnd,
            scale: overlayScale,
          });
        }
      }

      if (newOverlays.length > 0) {
        setOverlays(newOverlays);
        setOverlayProgress(`Added ${newOverlays.length} auto-generated overlays`);
      } else {
        setOverlayProgress("No matching media found");
      }

      setTimeout(() => setOverlayProgress(""), 3000);
    } catch {
      setOverlayProgress("Auto-overlay generation failed");
      setTimeout(() => setOverlayProgress(""), 3000);
    } finally {
      setIsGeneratingOverlays(false);
    }
  };

  const handleTranscribe = async (engine: TranscriptionEngine) => {
    if (!videoFile) return;
    setIsTranscribing(true);
    setUploadProgress(0);
    setTranscribeStatus("Uploading video…");
    try {
      const formData = new FormData();
      formData.append("file", videoFile);
      formData.append("engine", engine);

      const apiBase = process.env.NEXT_PUBLIC_TRANSCRIBE_API || "https://reelmix-api-production.up.railway.app";

      // Use XMLHttpRequest for upload progress
      const data = await new Promise<{ segments: SubtitleSegment[] }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", apiBase + "/transcribe");

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(pct);
            if (pct >= 100) {
              setTranscribeStatus("Extracting audio…");
            }
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Invalid response from server"));
            }
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.error || "Transcription failed"));
            } catch {
              reject(new Error("Server error: " + xhr.status));
            }
          }
        };

        xhr.onerror = () => reject(new Error("Network error — check your connection"));
        xhr.ontimeout = () => reject(new Error("Upload timed out — try a smaller file"));
        xhr.timeout = 300000; // 5 min timeout

        // After upload completes, server processes — update status
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 3) {
            setTranscribeStatus("Transcribing with AI…");
          }
        };

        xhr.send(formData);
      });

      setSegments(data.segments);
      setIsTranslated(false);
      runAutoOverlayPipeline(data.segments);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Transcription failed");
    } finally {
      setIsTranscribing(false);
      setTranscribeStatus("");
    }
  };

  const handleTranslate = async (lang: TargetLanguage) => {
    if (segments.length === 0 || lang === "original") return;
    setIsTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments, targetLanguage: lang, provider: aiConfig.translation }),
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
        body: JSON.stringify({
          keywords: keywords.split(/[,\s]+/).filter(Boolean),
        }),
      });
      const data = await res.json();
      setMediaItems(data.items ?? []);
    } catch {
      setMediaItems([]);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleAddAsOverlay = useCallback(
    (imageUrl: string) => {
      const overlay: ImageOverlay = {
        id: crypto.randomUUID(),
        imageUrl,
        position: "bottom-right",
        animation: "fade-in",
        startTime: 0,
        endTime: videoDuration || 10,
        scale: 0.3,
      };
      setOverlays((prev) => [...prev, overlay]);
    },
    [videoDuration],
  );

  const handleYouTubeImported = (file: File, _title: string) => {
    setSecondaryVideoFile(file);
    if (layoutConfig.layout === "main-only") {
      setLayoutConfig({ layout: "side-by-side", ratio: 0.5 });
    }
  };

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
    previewRef.current?.seek(time);
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Subtle background texture */}
      <div className="pointer-events-none fixed inset-0 dot-grid-subtle opacity-20" />

      {/* Header with step indicators */}
      <div className="relative mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-white/90">
            Video Editor
          </h1>
          <p className="mt-1.5 text-[13px] text-white/30">
            Upload, transcribe, enhance, and export your video
          </p>
        </div>

        {/* Step progress — premium pill */}
        <div className="glass-premium flex items-center gap-1 rounded-full px-2 py-1.5">
          {STEP_META.map((step, i) => {
            const isActive = step.id === activeStep;
            const isDone =
              step.id === "upload" && segments.length > 0;
            return (
              <div key={step.id} className="flex items-center">
                {i > 0 && (
                  <div
                    className={`mx-1 h-px w-5 transition-colors duration-300 ${
                      isDone ? "bg-[#3dd6c8]/50" : "bg-white/[0.06]"
                    }`}
                  />
                )}
                <div className="flex items-center gap-1.5">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${
                      isDone
                        ? "step-done text-black"
                        : isActive
                          ? "step-active text-white"
                          : "bg-white/[0.04] text-white/25"
                    }`}
                  >
                    {isDone ? (
                      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2.5-2.5a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    ) : (
                      step.num
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-medium transition-colors duration-300 ${
                      isActive ? "text-white/80" : "text-white/25"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload step */}
      {activeStep === "upload" && (
        <div className="relative mx-auto max-w-2xl space-y-6">
          <VideoUploader
            onVideoSelected={handleVideoSelected}
            onTranscribe={handleTranscribe}
            isProcessing={isTranscribing}
            statusMessage={transcribeStatus}
            uploadProgress={uploadProgress}
          />
          <FileHistory key={historyKey} />
        </div>
      )}

      {/* Edit step */}
      {activeStep === "edit" && (
        <div className="space-y-6">
          {/* Change video button */}
          <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.015] px-4 py-3">
            <p className="text-[12px] font-medium text-white/35">
              {videoFile?.name}
              {videoDuration > 0 && <span className="ml-2 text-white/20">{Math.round(videoDuration)}s</span>}
            </p>
            <button
              onClick={handleResetToUpload}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-1.5 text-[11px] font-semibold text-white/45 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white/70"
            >
              Change video
            </button>
          </div>

          {/* Auto B-roll status */}
          {(isGeneratingOverlays || overlayProgress) && (
            <div className="glass-premium flex items-center gap-3 rounded-2xl border border-[#3dd6c8]/15 px-5 py-3.5">
              {isGeneratingOverlays && (
                <span className="spinner" style={{ borderTopColor: "#3dd6c8" }} />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[#3dd6c8]/80">
                  {isGeneratingOverlays ? "Auto-generating B-roll" : "B-roll ready"}
                </p>
                {overlayProgress && (
                  <p className="truncate text-[11px] text-white/35">{overlayProgress}</p>
                )}
              </div>
            </div>
          )}

          {/* Main editing layout: preview + sidebar */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
            {/* Preview & timeline column */}
            <div className="space-y-4">
              <VideoPreview
                ref={previewRef}
                videoUrl={videoUrl}
                segments={segments}
                style={style}
                overlays={overlays}
                showSafeZones
                onTimeUpdate={handleTimeUpdate}
              />

              {/* Timeline */}
              <VideoTimeline
                videoUrl={videoUrl}
                videoDuration={videoDuration}
                segments={segments}
                overlays={overlays}
                titleText={titleText}
                onTitleChange={setTitleText}
                titleDuration={titleDuration}
                onTitleDurationChange={setTitleDuration}
                onSeek={handleSeek}
                currentTime={currentTime}
              />

              {/* Subtitle editor */}
              <SubtitleEditor
                segments={segments}
                onChange={setSegments}
                onTranslate={handleTranslate}
                isTranslating={isTranslating}
                isTranslated={isTranslated}
                targetLanguage={targetLanguage}
                onLanguageChange={setTargetLanguage}
              />
            </div>

            {/* Sidebar with tabs */}
            <div className="space-y-4">
              {/* Tab switcher */}
              <div className="glass-premium flex rounded-xl p-1">
                {(
                  [
                    { id: "style" as const, label: "Style" },
                    { id: "media" as const, label: "Media" },
                    { id: "layout" as const, label: "Layout" },
                    { id: "ai" as const, label: "AI" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSidebarTab(tab.id)}
                    className={`flex-1 rounded-lg px-3 py-2.5 text-[12px] font-semibold transition-all duration-200 ${
                      sidebarTab === tab.id
                        ? "bg-white/[0.08] text-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                        : "text-white/30 hover:text-white/55 hover:bg-white/[0.02]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Style tab */}
              {sidebarTab === "style" && (
                <div className="space-y-4">
                  <SubtitleStyler style={style} onChange={setStyle} />
                  <MusicPicker
                    selectedTrack={selectedTrack}
                    onSelect={setSelectedTrack}
                    musicVolume={musicVolume}
                    onVolumeChange={setMusicVolume}
                  />
                </div>
              )}

              {/* Media tab */}
              {sidebarTab === "media" && (
                <div className="space-y-4">
                  <ImageOverlayEditor
                    overlays={overlays}
                    onChange={setOverlays}
                    videoDuration={videoDuration}
                    mediaSuggestions={mediaItems
                      .filter((m) => m.type === "image" || m.type === "gif")
                      .map((m) => m.url)
                      .slice(0, 6)}
                  />

                  {segments.length > 0 && (
                    <button
                      onClick={() => runAutoOverlayPipeline(segments)}
                      disabled={isGeneratingOverlays}
                      className="w-full rounded-xl border border-cyan-500/20 bg-cyan-500/5 py-3 text-[12px] font-semibold text-cyan-400 transition hover:bg-cyan-500/10 disabled:opacity-40"
                    >
                      {isGeneratingOverlays
                        ? "Generating..."
                        : "Auto-generate B-roll from content"}
                    </button>
                  )}

                  <MediaSuggestions
                    items={mediaItems}
                    isLoading={mediaLoading}
                    onFetch={handleFetchMedia}
                    onAddAsOverlay={handleAddAsOverlay}
                  />
                </div>
              )}

              {/* Layout tab */}
              {sidebarTab === "layout" && (
                <div className="space-y-4">
                  <YouTubeImporter onVideoImported={handleYouTubeImported} />

                  <LayoutPicker
                    config={layoutConfig}
                    onChange={setLayoutConfig}
                    hasSecondaryVideo={!!secondaryVideoFile}
                  />
                </div>
              )}

              {/* AI tab */}
              {sidebarTab === "ai" && (
                <AIModelSettings config={aiConfig} onChange={setAIConfig} />
              )}
            </div>
          </div>

          {/* Export section - pinned to bottom */}
          <div className="glass-premium sticky bottom-4 z-20 rounded-2xl p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-white/90">Ready to export</h3>
                <p className="mt-1 text-[12px] text-white/30">
                  {segments.length} subtitles · {overlays.length} overlays
                  {selectedTrack ? ` · Music: ${selectedTrack.title}` : ""}
                  {titleText ? ` · Title: "${titleText}"` : ""}
                </p>
              </div>
              <VideoProcessor
                videoFile={videoFile}
                segments={segments}
                style={style}
                musicUrl={selectedTrack?.url ?? null}
                musicVolume={musicVolume}
                overlays={overlays}
                secondaryVideoFile={secondaryVideoFile}
                layoutConfig={layoutConfig}
                onExportComplete={handleExportComplete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
