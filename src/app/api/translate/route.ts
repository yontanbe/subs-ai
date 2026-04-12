import { NextRequest, NextResponse } from "next/server";
import type { SubtitleSegment, TargetLanguage, LLMProvider } from "@/types";

export const runtime = "edge";

const VALID_LANGUAGES: TargetLanguage[] = ["original", "he", "en"];
const VALID_PROVIDERS: LLMProvider[] = ["gemini", "openai"];

const LANGUAGE_NAMES: Record<Exclude<TargetLanguage, "original">, string> = {
  he: "Hebrew",
  en: "English",
};

function isValidSegment(s: unknown): s is SubtitleSegment {
  if (typeof s !== "object" || s === null) return false;
  const obj = s as Record<string, unknown>;
  return (
    typeof obj.start === "number" &&
    typeof obj.end === "number" &&
    typeof obj.text === "string"
  );
}

function buildPrompt(
  sanitized: { start: number; end: number; text: string }[],
  langName: string,
): string {
  return `You are a professional subtitle translator. Translate the following subtitle segments to ${langName}.
Return ONLY a valid JSON array with the same structure, preserving start and end times exactly.
Keep translations natural, colloquial, and appropriate for video subtitles.

Input segments:
${JSON.stringify(sanitized)}

Output format (JSON array only, no markdown):
[{"start": 0, "end": 1.5, "text": "${langName.toLowerCase()} text here"}, ...]`;
}

async function translateWithGemini(
  prompt: string,
  apiKey: string,
): Promise<SubtitleSegment[]> {
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
    },
  );

  if (!res.ok) throw new Error("Gemini translation service unavailable");

  const data = await res.json();
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error("Empty response from Gemini");
  }

  const raw = data.candidates[0].content.parts[0].text;
  const translated = JSON.parse(raw);

  if (!Array.isArray(translated) || !translated.every(isValidSegment)) {
    throw new Error("Gemini returned unexpected structure");
  }

  return translated;
}

async function translateWithOpenAI(
  prompt: string,
  apiKey: string,
): Promise<SubtitleSegment[]> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a professional subtitle translator. Return valid JSON only.",
        },
        {
          role: "user",
          content:
            prompt +
            '\n\nWrap the result in a JSON object: {"segments": [...]}',
        },
      ],
    }),
  });

  if (!res.ok) throw new Error("OpenAI translation service unavailable");

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");

  const parsed = JSON.parse(content);
  const segments: unknown[] = parsed.segments ?? parsed;

  if (!Array.isArray(segments) || !segments.every(isValidSegment)) {
    throw new Error("OpenAI returned unexpected structure");
  }

  return segments;
}

export async function POST(req: NextRequest) {
  let body: { segments?: unknown; targetLanguage?: unknown; provider?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { segments } = body;
  const targetLanguage = (
    VALID_LANGUAGES.includes(body.targetLanguage as TargetLanguage)
      ? body.targetLanguage
      : "he"
  ) as TargetLanguage;

  const provider = (
    VALID_PROVIDERS.includes(body.provider as LLMProvider)
      ? body.provider
      : "gemini"
  ) as LLMProvider;

  if (targetLanguage === "original") {
    if (!Array.isArray(segments) || !segments.every(isValidSegment)) {
      return NextResponse.json(
        { error: "Invalid segment format" },
        { status: 400 },
      );
    }
    return NextResponse.json({ segments });
  }

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

  const langName = LANGUAGE_NAMES[targetLanguage];
  const prompt = buildPrompt(sanitized, langName);

  try {
    let translated: SubtitleSegment[];

    if (provider === "openai") {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "OPENAI_API_KEY not configured" },
          { status: 500 },
        );
      }
      translated = await translateWithOpenAI(prompt, apiKey);
    } else {
      const geminiKey = process.env.GEMINI_API_KEY;
      if (geminiKey) {
        try {
          translated = await translateWithGemini(prompt, geminiKey);
        } catch {
          const openaiKey = process.env.OPENAI_API_KEY;
          if (openaiKey) {
            translated = await translateWithOpenAI(prompt, openaiKey);
          } else {
            return NextResponse.json(
              { error: "Gemini quota exceeded and no OpenAI fallback" },
              { status: 503 },
            );
          }
        }
      } else {
        return NextResponse.json(
          { error: "GEMINI_API_KEY not configured" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ segments: translated });
  } catch (err) {
    console.error("Translation error:", err);
    const message =
      err instanceof Error ? err.message : "Translation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
