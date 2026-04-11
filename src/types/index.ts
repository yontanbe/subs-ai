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
