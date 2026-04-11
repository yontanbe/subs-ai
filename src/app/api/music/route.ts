import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "background";
  const apiKey = process.env.PIXABAY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "PIXABAY_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(q)}&per_page=12`
    );

    if (!res.ok) {
      const fallbackRes = await fetch(
        `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(q)}&category=music&per_page=12`
      );
      if (!fallbackRes.ok) {
        throw new Error("Pixabay API error");
      }
    }

    const musicRes = await fetch(
      `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(q + " music")}&per_page=20`
    );

    const tracks: Array<{
      id: number;
      title: string;
      url: string;
      previewUrl: string;
      duration: number;
      tags: string;
    }> = [];

    if (musicRes.ok) {
      const data = await musicRes.json();
      for (const hit of data.hits ?? []) {
        tracks.push({
          id: hit.id,
          title: hit.tags || "Untitled Track",
          url: hit.previewURL || hit.webformatURL || "",
          previewUrl: hit.previewURL || hit.webformatURL || "",
          duration: 0,
          tags: hit.tags || "",
        });
      }
    }

    return NextResponse.json({ tracks });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch music";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
