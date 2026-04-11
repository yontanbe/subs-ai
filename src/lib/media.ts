import type { MediaItem } from "@/types";

export async function fetchKeywordMedia(
  keywords: string[]
): Promise<MediaItem[]> {
  const res = await fetch("/api/keywords", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keywords }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.items;
}
