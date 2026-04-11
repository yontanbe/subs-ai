import type { MusicTrack } from "@/types";

export async function searchMusic(query: string): Promise<MusicTrack[]> {
  const res = await fetch(
    `/api/music?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.tracks;
}
