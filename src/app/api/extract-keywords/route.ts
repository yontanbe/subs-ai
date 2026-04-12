import { NextRequest, NextResponse } from "next/server";
import type { SubtitleSegment, LLMProvider } from "@/types";

export const runtime = "edge";

const VALID_PROVIDERS: LLMProvider[] = ["gemini", "openai"];

function isValidSegment(s: unknown): s is SubtitleSegment {
  if (typeof s !== "object" || s === null) return false;
  const obj = s as Record<string, unknown>;
  return (
    typeof obj.start === "number" &&
    typeof obj.end === "number" &&
    typeof obj.text === "string"
  );
}

function isKeywordEntry(
  x: unknown,
): x is { keyword: string; startTime: number; endTime: number } {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.keyword === "string" &&
    typeof o.startTime === "number" &&
    typeof o.endTime === "number"
  );
}

function buildPrompt(
  sanitized: { start: number; end: number; text: string }[],
): string {
  return `You analyze video subtitle segments and extract 5 to 10 concise visual keywords or short phrases that would help find stock images, B-roll, or illustrations for the video.

For each keyword:
- Choose startTime and endTime (seconds, numbers) indicating when that keyword is most relevant based on the subtitle timeline. Use segment boundaries; startTime must be <= endTime.

Input segments (JSON):
${JSON.stringify(sanitized)}

Return ONLY valid JSON (no markdown) in this exact shape:
{"keywords":[{"keyword":"string","startTime":0,"endTime":1.5},...]}`;
}

async function extractWithGemini(
  prompt: string,
  apiKey: string,
): Promise<{ keyword: string; startTime: number; endTime: number }[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!res.ok) throw new Error("Gemini keyword extraction unavailable");

  const data = await res.json();
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error("Empty response from Gemini");
  }

  const raw = data.candidates[0].content.parts[0].text;
  const parsed = JSON.parse(raw);

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("keywords" in parsed)
  ) {
    throw new Error("Gemini returned unexpected structure");
  }

  const list = (parsed as { keywords: unknown }).keywords;
  if (!Array.isArray(list) || !list.every(isKeywordEntry)) {
    throw new Error("Gemini returned unexpected keyword structure");
  }

  return list;
}

async function extractWithOpenAI(
  prompt: string,
  apiKey: string,
): Promise<{ keyword: string; startTime: number; endTime: number }[]> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You extract visual keywords from subtitle segments. Return valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) throw new Error("OpenAI keyword extraction unavailable");

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");

  const parsed = JSON.parse(content);

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("keywords" in parsed)
  ) {
    throw new Error("OpenAI returned unexpected structure");
  }

  const list = (parsed as { keywords: unknown }).keywords;
  if (!Array.isArray(list) || !list.every(isKeywordEntry)) {
    throw new Error("OpenAI returned unexpected keyword structure");
  }

  return list;
}

function postProcessKeywords(
  list: { keyword: string; startTime: number; endTime: number }[],
) {
  const keywords = list.map((k) => ({
    keyword: k.keyword.trim().slice(0, 120),
    startTime: Math.max(0, k.startTime),
    endTime: Math.max(0, k.endTime),
  }));

  for (const k of keywords) {
    if (k.startTime > k.endTime) {
      const t = k.startTime;
      k.startTime = k.endTime;
      k.endTime = t;
    }
  }

  return keywords;
}

export async function POST(req: NextRequest) {
  let body: { segments?: unknown; provider?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { segments } = body;

  const provider = (
    VALID_PROVIDERS.includes(body.provider as LLMProvider)
      ? body.provider
      : "gemini"
  ) as LLMProvider;

  if (!Array.isArray(segments) || segments.length === 0) {
    return NextResponse.json(
      { error: "No segments provided" },
      { status: 400 },
    );
  }

  if (segments.length > 200) {
    return NextResponse.json(
      { error: "Too many segments (max 200)" },
      { status: 400 },
    );
  }

  if (!segments.every(isValidSegment)) {
    return NextResponse.json(
      { error: "Invalid segment format" },
      { status: 400 },
    );
  }

  const sanitized = segments.map((s) => ({
    start: s.start,
    end: s.end,
    text: s.text.slice(0, 500),
  }));

  const prompt = buildPrompt(sanitized);

  try {
    let rawKeywords: { keyword: string; startTime: number; endTime: number }[];

    if (provider === "openai") {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "OPENAI_API_KEY not configured" },
          { status: 500 },
        );
      }
      rawKeywords = await extractWithOpenAI(prompt, apiKey);
    } else {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "GEMINI_API_KEY not configured" },
          { status: 500 },
        );
      }
      rawKeywords = await extractWithGemini(prompt, apiKey);
    }

    const keywords = postProcessKeywords(rawKeywords);
    return NextResponse.json({ keywords });
  } catch (err) {
    console.error("extract-keywords error:", err);
    const message =
      err instanceof Error ? err.message : "Keyword extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
