import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const YOUTUBE_ID = /^[a-zA-Z0-9_-]{11}$/;

function extractYouTubeVideoId(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    const host = u.hostname.replace(/^www\./i, "");

    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && YOUTUBE_ID.test(id) ? id : null;
    }

    if (!host.endsWith("youtube.com")) return null;

    if (u.pathname === "/watch" || u.pathname.startsWith("/watch")) {
      const v = u.searchParams.get("v");
      return v && YOUTUBE_ID.test(v) ? v : null;
    }

    if (u.pathname.startsWith("/shorts/")) {
      const id = u.pathname.split("/").filter(Boolean)[1];
      return id && YOUTUBE_ID.test(id) ? id : null;
    }

    if (u.pathname.startsWith("/embed/")) {
      const id = u.pathname.split("/").filter(Boolean)[1];
      return id && YOUTUBE_ID.test(id) ? id : null;
    }

    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const url =
    typeof body === "object" &&
    body !== null &&
    "url" in body &&
    typeof (body as { url: unknown }).url === "string"
      ? (body as { url: string }).url.trim()
      : "";

  if (!url) {
    return NextResponse.json(
      { error: "Missing or invalid url" },
      { status: 400 }
    );
  }

  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    return NextResponse.json(
      { error: "Not a supported YouTube URL" },
      { status: 400 }
    );
  }

  let title = "YouTube video";
  let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  try {
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      { next: { revalidate: 0 } }
    );
    if (oembedRes.ok) {
      const meta = (await oembedRes.json()) as {
        title?: string;
        thumbnail_url?: string;
      };
      if (meta.title) title = meta.title;
      if (meta.thumbnail_url) thumbnailUrl = meta.thumbnail_url;
    }
  } catch (e) {
    console.warn("YouTube oEmbed failed:", e);
  }

  try {
    const cobaltRes = await fetch("https://api.cobalt.tools/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const cobaltText = await cobaltRes.text();
    let cobaltJson: unknown;
    try {
      cobaltJson = JSON.parse(cobaltText);
    } catch {
      return NextResponse.json(
        { error: "Download service returned an unexpected response" },
        { status: 502 }
      );
    }

    const downloadUrl =
      typeof cobaltJson === "object" &&
      cobaltJson !== null &&
      "url" in cobaltJson &&
      typeof (cobaltJson as { url: unknown }).url === "string"
        ? (cobaltJson as { url: string }).url
        : null;

    if (!cobaltRes.ok || !downloadUrl) {
      const message =
        typeof cobaltJson === "object" &&
        cobaltJson !== null &&
        "text" in cobaltJson &&
        typeof (cobaltJson as { text: unknown }).text === "string"
          ? (cobaltJson as { text: string }).text
        : typeof cobaltJson === "object" &&
            cobaltJson !== null &&
            "message" in cobaltJson &&
            typeof (cobaltJson as { message: unknown }).message === "string"
          ? (cobaltJson as { message: string }).message
          : "Could not resolve a download link";

      return NextResponse.json(
        { error: message },
        { status: cobaltRes.ok ? 502 : cobaltRes.status }
      );
    }

    return NextResponse.json({
      downloadUrl,
      title,
      thumbnailUrl,
    });
  } catch (e) {
    console.error("Cobalt API error:", e);
    return NextResponse.json(
      { error: "Download service is unavailable. Try again later." },
      { status: 503 }
    );
  }
}
