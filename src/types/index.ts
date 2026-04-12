export interface SubtitleSegment {
  start: number;
  end: number;
  text: string;
}

export interface SubtitleStyle {
  fontSize: number;
  primaryColor: string;
  outlineColor: string;
  fontName: string;
}

export interface MediaItem {
  id: string;
  type: "image" | "gif" | "ai";
  url: string;
  thumbnailUrl: string;
  alt: string;
  source: "pexels" | "giphy" | "nano-banana";
}

export interface MusicTrack {
  id: number;
  title: string;
  url: string;
  previewUrl: string;
  duration: number;
  tags: string;
}

export interface CalendarEntry {
  id: string;
  title: string;
  description: string;
  platform: "instagram" | "tiktok" | "youtube";
  scheduled_date: string;
  color: string;
  created_at: string;
}

export type TranscriptionEngine = "groq" | "openai";

export type TargetLanguage = "original" | "he" | "en";

export type OverlayPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center";

export type OverlayAnimation =
  | "none"
  | "fade-in"
  | "slide-left"
  | "slide-right"
  | "slide-up"
  | "zoom";

export interface ImageOverlay {
  id: string;
  imageUrl: string;
  position: OverlayPosition;
  animation: OverlayAnimation;
  startTime: number;
  endTime: number;
  scale: number;
}

export type VideoLayout =
  | "pip"
  | "side-by-side"
  | "top-bottom"
  | "blur-bg"
  | "split-border"
  | "main-only";

export type PipCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface LayoutConfig {
  layout: VideoLayout;
  pipCorner?: PipCorner;
  ratio?: number; // 0.3 to 0.7 — proportion for first video
}

export type SafeZonePlatform = "instagram" | "tiktok" | "youtube";

export type LLMProvider = "gemini" | "openai";

export interface AIModelConfig {
  transcription: TranscriptionEngine;
  translation: LLMProvider;
  keywordExtraction: LLMProvider;
}

export interface HistoryEntry {
  id: string;
  fileName: string;
  createdAt: string;
  duration: number;
  subtitleCount: number;
  overlayCount: number;
  language: TargetLanguage;
  hasMusic: boolean;
  thumbnailDataUrl?: string;
}
