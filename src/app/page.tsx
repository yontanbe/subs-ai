import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
        Subs<span className="text-indigo-400">AI</span>
      </h1>
      <p className="mt-4 max-w-lg text-lg text-zinc-400">
        Upload a video, transcribe with Whisper, translate to Hebrew, style your
        subtitles, add images and background music — then download the final
        video.
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/editor"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-500 px-8 text-base font-semibold text-white transition hover:bg-indigo-400"
        >
          Open Editor
        </Link>
        <Link
          href="/calendar"
          className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-700 px-8 text-base font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
        >
          Content Calendar
        </Link>
      </div>

      <div className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          {
            title: "Transcribe",
            desc: "Whisper-powered speech-to-text via Groq or OpenAI",
          },
          {
            title: "Translate",
            desc: "Automatic Hebrew translation with Gemini AI",
          },
          {
            title: "Customize",
            desc: "Control font size, color, add music and keyword images",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-left"
          >
            <h3 className="text-base font-semibold text-white">{f.title}</h3>
            <p className="mt-2 text-sm text-zinc-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
