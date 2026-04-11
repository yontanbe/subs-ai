import { NextRequest, NextResponse } from "next/server";
import type { SubtitleSegment, TranscriptionEngine } from "@/types";

export const runtime = "edge";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const ALLOWED_TYPES = [
  "audio/",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/mpeg",
];

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const engine = formData.get("engine") as string;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large (max 25 MB)" },
      { status: 413 }
    );
  }

  if (!ALLOWED_TYPES.some((t) => file.type.startsWith(t))) {
    return NextResponse.json(
      { error: "Invalid file type. Supported: audio/video files" },
      { status: 415 }
    );
  }

  const validEngines: TranscriptionEngine[] = ["groq", "openai"];
  const selectedEngine = validEngines.includes(engine as TranscriptionEngine)
    ? (engine as TranscriptionEngine)
    : "groq";

  try {
    const segments =
      selectedEngine === "openai"
        ? await transcribeOpenAI(file)
        : await transcribeGroq(file);
    return NextResponse.json({ segments });
  } catch (err) {
    console.error("Transcription error:", err);
    return NextResponse.json(
      { error: "Transcription failed. Please try again." },
      { status: 500 }
    );
  }
}

function mapSegments(
  data: { segments?: Array<{ start: number; end: number; text: string }> }
): SubtitleSegment[] {
  return (data.segments ?? []).map((s) => ({
    start: s.start,
    end: s.end,
    text: s.text.trim(),
  }));
}

async function transcribeGroq(file: File): Promise<SubtitleSegment[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not configured");

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

  if (!res.ok) throw new Error("Groq transcription failed");
  return mapSegments(await res.json());
}

async function transcribeOpenAI(file: File): Promise<SubtitleSegment[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

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

  if (!res.ok) throw new Error("OpenAI transcription failed");
  return mapSegments(await res.json());
}
