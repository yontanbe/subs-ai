import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { keywords, source } = await req.json();

  if (!Array.isArray(keywords) || keywords.length === 0) {
    return NextResponse.json(
      { error: "No keywords provided" },
      { status: 400 }
    );
  }

  const query = keywords.join(" ");

  if (source === "nano-banana") {
    const items = await fetchNanoBanana(query);
    return NextResponse.json({ items });
  }

  const [pexelsItems, giphyItems, aiItems] = await Promise.all([
    fetchPexels(query),
    fetchGiphy(query),
    fetchNanoBanana(query),
  ]);

  return NextResponse.json({
    items: [...aiItems, ...pexelsItems, ...giphyItems],
  });
}

async function fetchPexels(
  query: string
): Promise<Array<{ id: string; type: string; url: string; thumbnailUrl: string; alt: string; source: string }>> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=6`,
      { headers: { Authorization: apiKey } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.photos ?? []).map(
      (p: { id: number; src: { medium: string; small: string }; alt: string }) => ({
        id: `pexels-${p.id}`,
        type: "image",
        url: p.src.medium,
        thumbnailUrl: p.src.small,
        alt: p.alt || query,
        source: "pexels",
      })
    );
  } catch {
    return [];
  }
}

async function fetchGiphy(
  query: string
): Promise<Array<{ id: string; type: string; url: string; thumbnailUrl: string; alt: string; source: string }>> {
  const apiKey = process.env.GIPHY_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=6&rating=g`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data ?? []).map(
      (g: {
        id: string;
        title: string;
        images: {
          fixed_height: { url: string };
          fixed_height_small: { url: string };
        };
      }) => ({
        id: `giphy-${g.id}`,
        type: "gif",
        url: g.images.fixed_height.url,
        thumbnailUrl: g.images.fixed_height_small.url,
        alt: g.title || query,
        source: "giphy",
      })
    );
  } catch {
    return [];
  }
}

async function fetchNanoBanana(
  prompt: string
): Promise<Array<{ id: string; type: string; url: string; thumbnailUrl: string; alt: string; source: string }>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate a simple, clean illustration for: "${prompt}". Make it suitable as a video overlay.`,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find(
      (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData
    );

    if (!imagePart?.inlineData) return [];

    const dataUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    return [
      {
        id: `ai-${Date.now()}`,
        type: "ai",
        url: dataUrl,
        thumbnailUrl: dataUrl,
        alt: prompt,
        source: "nano-banana",
      },
    ];
  } catch {
    return [];
  }
}
