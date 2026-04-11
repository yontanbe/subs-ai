import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  const { segments } = await req.json();
  if (!Array.isArray(segments) || segments.length === 0) {
    return NextResponse.json(
      { error: "No segments provided" },
      { status: 400 }
    );
  }

  const prompt = `You are a professional subtitle translator. Translate the following subtitle segments to Hebrew.
Return ONLY a valid JSON array with the same structure, preserving start and end times exactly.
Keep translations natural, colloquial, and appropriate for video subtitles.

Input segments:
${JSON.stringify(segments)}

Output format (JSON array only, no markdown):
[{"start": 0, "end": 1.5, "text": "hebrew text here"}, ...]`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini API error: ${text}`);
    }

    const data = await res.json();
    const raw =
      data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
    const translated = JSON.parse(raw);

    return NextResponse.json({ segments: translated });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Translation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
