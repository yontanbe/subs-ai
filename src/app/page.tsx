import Link from "next/link";

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
    title: "Transcribe",
    desc: "Whisper-powered speech-to-text via Groq (free) or OpenAI",
    accent: "from-[#e09145]/20 to-transparent",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
      </svg>
    ),
    title: "Translate",
    desc: "Automatic Hebrew translation powered by Gemini AI",
    accent: "from-[#3dd6c8]/20 to-transparent",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
    title: "Customize",
    desc: "Control font size, color, add background music and images",
    accent: "from-purple-500/20 to-transparent",
  },
];

export default function Home() {
  return (
    <div className="hero-gradient flex flex-1 flex-col items-center px-4 pt-24 pb-16 sm:pt-32">
      {/* Badge */}
      <div className="animate-fade-up flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-[#3dd6c8] animate-pulse" />
        <span className="text-xs font-medium text-white/50">
          100% free tier stack
        </span>
      </div>

      {/* Headline */}
      <h1 className="animate-fade-up stagger-1 mt-8 max-w-2xl text-center text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
        <span className="text-white/90">Video subtitles,</span>
        <br />
        <span className="bg-gradient-to-r from-[#e09145] via-[#f0b678] to-[#3dd6c8] bg-clip-text text-transparent">
          translated & burned
        </span>
      </h1>

      <p className="animate-fade-up stagger-2 mt-5 max-w-md text-center text-[15px] leading-relaxed text-white/40">
        Upload a video. Whisper transcribes it. Gemini translates to Hebrew. You
        style the subtitles, pick background music, and export—all in the
        browser.
      </p>

      {/* CTAs */}
      <div className="animate-fade-up stagger-3 mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/editor"
          className="btn-glow inline-flex h-11 items-center justify-center rounded-xl px-7 text-[13px] font-semibold text-white"
        >
          Open Editor
        </Link>
        <Link
          href="/calendar"
          className="btn-secondary inline-flex h-11 items-center justify-center rounded-xl px-7 text-[13px] font-semibold text-white/70"
        >
          Content Calendar
        </Link>
      </div>

      {/* Feature cards */}
      <div className="mt-20 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className={`animate-fade-up stagger-${i + 3} group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-b ${f.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
            />
            <div className="relative">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/60 transition group-hover:text-[#e09145]">
                {f.icon}
              </div>
              <h3 className="text-[13px] font-semibold text-white/80">
                {f.title}
              </h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-white/35">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tech line */}
      <div className="animate-fade-up stagger-5 mt-16 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-medium uppercase tracking-wider text-white/20">
        <span>Groq</span>
        <span className="text-white/10">·</span>
        <span>OpenAI</span>
        <span className="text-white/10">·</span>
        <span>Gemini</span>
        <span className="text-white/10">·</span>
        <span>FFmpeg</span>
        <span className="text-white/10">·</span>
        <span>Pexels</span>
        <span className="text-white/10">·</span>
        <span>Pixabay</span>
      </div>
    </div>
  );
}
