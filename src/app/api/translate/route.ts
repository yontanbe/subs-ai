import { NextRequest, NextResponse } from "next/server";
import type { SubtitleSegment } from "@/types";

export const runtime = "edge";

function isValidSegment(s: unknown): s is SubtitleSegment {
  if (typeof s !== "object" || s === null) return false;
  const obj = s as Record<string, unknown>;
  return (
    typeof obj.start === "number" &&
    typeof obj.end === "number" &&
    typeof obj.text === "string"
  );
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  let body: { segments?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { segments } = body;
  if (!Array.isArray(segments) || segments.length === 0) {
    return NextResponse.json(
      { error: "No segments provided" },
      { status: 400 }
    );
  }

  if (segments.length > 200) {
    return NextResponse.json(
      { error: "Too many segments (max 200)" },
      { status: 400 }
    );
  }

  if (!segments.every(isValidSegment)) {
    return NextResponse.json(
      { error: "Invalid segment format" },
      { status: 400 }
    );
  }

  const sanitized = segments.map((s) => ({
    start: s.start,
    end: s.end,
    text: s.text.slice(0, 500),
  }));

  const prompt = `You are a professional subtitle translator. Translate the following subtitle segments to Hebrew.
Return ONLY a valid JSON array with the same structure, preserving start and end times exactly.
Keep translations natural, colloquial, and appropriate for video subtitles.

Input segments:
${JSON.stringify(sanitized)}

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
      console.error("Gemini API error:", res.status);
      throw new Error("Translation service unavailable");
    }

    const data = await res.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Empty response from translation service");
    }

    const raw = data.candidates[0].content.parts[0].text;

    let translated: unknown;
    try {
      translated = JSON.parse(raw);
    } catch {
      throw new Error("Translation returned invalid format");
    }

    if (!Array.isArray(translated) || !translated.every(isValidSegment)) {
      throw new Error("Translation returned unexpected structure");
    }

    return NextResponse.json({ segments: translated });
  } catch (err) {
    console.error("Translation error:", err);
    const message =
      err instanceof Error ? err.message : "Translation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
