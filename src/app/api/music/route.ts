import { NextRequest, NextResponse } from "next/server";
import type { MusicTrack } from "@/types";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "background").slice(0, 100);
  const apiKey = process.env.PIXABAY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "PIXABAY_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(q + " music audio")}&per_page=20`
    );

    if (!res.ok) {
      console.error("Pixabay API error:", res.status);
      return NextResponse.json({ tracks: [] });
    }

    const data = await res.json();

    const tracks: MusicTrack[] = (data.hits ?? []).map(
      (hit: {
        id: number;
        tags: string;
        previewURL?: string;
        webformatURL?: string;
      }) => ({
        id: hit.id,
        title: hit.tags || "Untitled Track",
        url: hit.previewURL || hit.webformatURL || "",
        previewUrl: hit.previewURL || hit.webformatURL || "",
        duration: 0,
        tags: hit.tags || "",
      })
    );

    return NextResponse.json({ tracks });
  } catch (err) {
    console.error("Music search error:", err);
    return NextResponse.json({ tracks: [] });
  }
}
