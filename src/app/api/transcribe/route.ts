import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const engine = (formData.get("engine") as string) || "groq";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    if (engine === "openai") {
      return await transcribeOpenAI(file);
    }
    return await transcribeGroq(file);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function transcribeGroq(file: File) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY not configured" },
      { status: 500 }
    );
  }

  const form = new FormData();
  form.append("file", file);
  form.append("model", "whisper-large-v3-turbo");
  form.append("response_format", "verbose_json");

  const res = await fetch(
    "https://api.groq.com/openai/v1/audio/transcriptions",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error: ${text}`);
  }

  const data = await res.json();
  const segments = (data.segments ?? []).map(
    (s: { start: number; end: number; text: string }) => ({
      start: s.start,
      end: s.end,
      text: s.text.trim(),
    })
  );

  return NextResponse.json({ segments, language: data.language });
}

async function transcribeOpenAI(file: File) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 500 }
    );
  }

  const form = new FormData();
  form.append("file", file);
  form.append("model", "whisper-1");
  form.append("response_format", "verbose_json");

  const res = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API error: ${text}`);
  }

  const data = await res.json();
  const segments = (data.segments ?? []).map(
    (s: { start: number; end: number; text: string }) => ({
      start: s.start,
      end: s.end,
      text: s.text.trim(),
    })
  );

  return NextResponse.json({ segments, language: data.language });
}
