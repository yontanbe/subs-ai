import type { SubtitleSegment, SubtitleStyle } from "@/types";

function toTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.round((seconds % 1) * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function colorToASS(hex: string): string {
  const r = hex.slice(1, 3);
  const g = hex.slice(3, 5);
  const b = hex.slice(5, 7);
  return `&H00${b.toUpperCase()}${g.toUpperCase()}${r.toUpperCase()}`;
}

export function generateASS(
  segments: SubtitleSegment[],
  style: SubtitleStyle
): string {
  const primaryASS = colorToASS(style.primaryColor);
  const outlineASS = colorToASS(style.outlineColor);

  const header = `[Script Info]
Title: ReelMix
ScriptType: v4.00+
WrapStyle: 0
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${style.fontName},${style.fontSize},${primaryASS},&H000000FF,${outlineASS},&H80000000,0,0,0,0,100,100,0,0,1,3,1,2,30,30,60,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;

  const events = segments
    .map(
      (seg) =>
        `Dialogue: 0,${toTimestamp(seg.start)},${toTimestamp(seg.end)},Default,,0,0,0,,${seg.text}`
    )
    .join("\n");

  return `${header}\n${events}\n`;
}

export function generateSRT(segments: SubtitleSegment[]): string {
  return segments
    .map((seg, i) => {
      const start = formatSRTTime(seg.start);
      const end = formatSRTTime(seg.end);
      return `${i + 1}\n${start} --> ${end}\n${seg.text}\n`;
    })
    .join("\n");
}

function formatSRTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}
