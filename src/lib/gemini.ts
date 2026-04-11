import type { SubtitleSegment } from "@/types";

export async function translateToHebrew(
  segments: SubtitleSegment[]
): Promise<SubtitleSegment[]> {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ segments }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.segments;
}
