"use client";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

/* ─── Data ────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    title: "AI Transcription",
    desc: "Whisper-powered speech-to-text. Supports any language.",
    accent: "#e09145",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
        <rect x="6" y="2" width="20" height="28" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 10v6m0 0a2 2 0 002-2v-2a2 2 0 00-4 0v2a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 15a4 4 0 008 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="19" x2="16" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="13" y1="22" x2="19" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Smart Translation",
    desc: "Translate to Hebrew, English, or keep original. Natural, colloquial results.",
    accent: "#3dd6c8",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
        <circle cx="11" cy="16" r="8" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="21" cy="16" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M15 10.5a8 8 0 010 11" stroke="currentColor" strokeWidth="1.5" />
        <path d="M17 10.5a8 8 0 000 11" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Auto B-Roll",
    desc: "AI analyzes your content and places relevant images at the right moments.",
    accent: "#a78bfa",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
        <rect x="3" y="6" width="26" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <rect x="7" y="10" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="14" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="#030305" />
        <circle cx="18" cy="16" r="1" fill="currentColor" />
        <path d="M15.5 22l3-3.5 2.5 2 3-4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "YouTube Import",
    desc: "Paste a YouTube URL. Import and combine with your video in any layout.",
    accent: "#ef4444",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
        <rect x="4" y="7" width="24" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M13 12.5v7l6.5-3.5L13 12.5z" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Music Library",
    desc: "Browse royalty-free tracks from Pixabay. Mix volume and mood.",
    accent: "#f59e0b",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
        <path d="M12 26a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M24 22a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M15 23V9l12-4v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 15l12-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Subtitle Styling",
    desc: "Custom fonts, colors, sizes. Professional typography on every frame.",
    accent: "#f472b6",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
        <path d="M6 8h20M10 8v16M22 8v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 24h6M19 24h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="13" y="18" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1" />
        <circle cx="16" cy="13" r="2" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    title: "Upload",
    desc: "Drop your video \u2014 any format, any length.",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="h-10 w-10">
        <rect x="4" y="4" width="32" height="32" rx="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M20 26V14m0 0l-5 5m5-5l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "AI Processing",
    desc: "Transcribe + translate + extract keywords.",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="h-10 w-10">
        <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.5" />
        <path d="M20 10c-2 4-2 8 0 10s2 6 0 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M14 14h12M13 20h14M14 26h12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        <circle cx="28" cy="10" r="4" fill="#030305" stroke="currentColor" strokeWidth="1.2" />
        <path d="M27 10l1 1 2-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Auto B-Roll",
    desc: "AI finds and places relevant images & GIFs.",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="h-10 w-10">
        <rect x="4" y="8" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <rect x="16" y="18" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" fill="#030305" />
        <path d="M18 32l5-6 3 3 5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="22" cy="23" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Export",
    desc: "Burned subtitles, overlays, music \u2014 done.",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="h-10 w-10">
        <rect x="4" y="4" width="32" height="32" rx="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M20 14v12m0 0l-5-5m5 5l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 30h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const TECH = ["Groq", "OpenAI Whisper", "Gemini", "FFmpeg", "Pexels", "Pixabay", "Next.js", "React"];

const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  left: `${(i * 13 + 7) % 100}%`,
  top: `${(i * 19 + 3) % 100}%`,
  delay: `${(i * 0.6) % 8}s`,
  size: i % 5 === 0 ? 4 : i % 3 === 0 ? 3 : 2,
  duration: 4 + (i % 5),
  color: i % 7 === 0 ? "rgba(224,145,69,0.25)" : i % 5 === 0 ? "rgba(61,214,200,0.2)" : "rgba(255,255,255,0.1)",
}));

/* ─── Component ───────────────────────────────────────────────────────── */

export default function Home() {
  const { isSignedIn } = useUser();
  const isLoggedIn = !!isSignedIn;
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const targets = document.querySelectorAll(
      ".scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale"
    );
    targets.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
        {/* Aurora nebula orbs */}
        <div className="aurora-orb aurora-orb-1 -top-40 -left-60" />
        <div className="aurora-orb aurora-orb-2 -right-40 top-20" />
        <div className="aurora-orb aurora-orb-3 bottom-10 left-1/4" />
        <div className="aurora-orb aurora-orb-4 -bottom-20 right-1/4" />

        {/* Dot grid overlay */}
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-60" />

        {/* Floating particles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                background: p.color,
                animation: `orbFloat ${p.duration}s ease-in-out infinite`,
                animationDelay: p.delay,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Status badge */}
          <div className="animate-fade-up glass-premium flex items-center gap-2.5 rounded-full px-6 py-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3dd6c8] opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3dd6c8]" />
            </span>
            <span className="text-xs font-medium tracking-wide text-white/50">
              {isLoggedIn
                ? "Welcome back \u2014 your studio awaits"
                : "100% browser-based \u00b7 No install needed"}
            </span>
          </div>

          {/* Main headline */}
          <h1 className="animate-fade-up stagger-1 mt-12 max-w-4xl text-center text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl lg:text-[88px]">
            <span className="text-white">Auto-subtitle</span>
            <br />
            <span className="text-gradient-animated">
              any video.
            </span>
          </h1>

          {/* Subtext */}
          <p className="animate-fade-up stagger-2 mt-8 max-w-xl text-center text-[17px] leading-relaxed text-white/35 sm:text-lg">
            AI transcription. Smart translation. Auto B-roll. Music.
            <br className="hidden sm:block" />
            All burned in&nbsp;&mdash; right in your browser.
          </p>

          {/* CTA buttons */}
          <div className="animate-fade-up stagger-3 mt-14 flex flex-col gap-4 sm:flex-row">
            {isLoggedIn ? (
              <>
                <Link
                  href="/editor"
                  className="btn-glow inline-flex h-14 items-center justify-center rounded-2xl px-10 text-[15px] font-semibold text-white"
                >
                  Open Editor
                </Link>
                <Link
                  href="/calendar"
                  className="btn-secondary inline-flex h-14 items-center justify-center rounded-2xl px-10 text-[15px] font-semibold text-white/70"
                >
                  Content Calendar
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="btn-glow inline-flex h-14 items-center justify-center rounded-2xl px-10 text-[15px] font-semibold text-white"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/login"
                  className="btn-secondary inline-flex h-14 items-center justify-center rounded-2xl px-10 text-[15px] font-semibold text-white/70"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Trust signals */}
          <div className="animate-fade-up stagger-4 mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/25">
            {[
              "No watermark",
              "No signup required",
              "100% browser-based",
            ].map((label, i) => (
              <span key={label} className="flex items-center gap-2">
                {i > 0 && <span className="mr-4 hidden text-white/[0.08] sm:inline">{"\u00b7"}</span>}
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-[#3dd6c8]/50">
                  <path d="M8 1.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13zm2.854 4.146a.5.5 0 00-.708 0L7 8.793 5.854 7.646a.5.5 0 10-.708.708l1.5 1.5a.5.5 0 00.708 0l3.5-3.5a.5.5 0 000-.708z" />
                </svg>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-up stagger-5">
          <div className="flex flex-col items-center gap-3 text-white/12">
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium">Scroll</span>
            <svg viewBox="0 0 16 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-3 animate-bounce">
              <rect x="1" y="1" width="14" height="22" rx="7" />
              <circle cx="8" cy="7" r="1.5" fill="currentColor" />
            </svg>
          </div>
        </div>
      </section>

      {/* ═══════════════════ LIVE DEMO PLAYER ═══════════════════ */}
      <section className="relative -mt-20 px-4 pb-20 sm:pb-32">
        <div className="mx-auto max-w-4xl">
          <div className="scroll-reveal-scale demo-player">
            {/* Browser chrome bar */}
            <div className="flex items-center gap-2 border-b border-white/[0.04] bg-white/[0.02] px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/[0.08]" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/[0.08]" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/[0.08]" />
              </div>
              <div className="ml-4 flex-1 rounded-md bg-white/[0.04] px-3 py-1">
                <span className="text-[10px] font-medium text-white/20">reelmix.app/editor</span>
              </div>
            </div>

            {/* Video viewport */}
            <div className="demo-player-inner">
              {/* Simulated scene with ambient lighting */}
              <div className="demo-scene" />

              {/* Simulated person silhouette */}
              <div className="demo-silhouette" />

              {/* Animated play button pulse */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-white/[0.06] animate-ping" style={{ animationDuration: "3s" }} />
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.06] backdrop-blur-sm">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-5 w-5 text-white/60">
                      <path d="M8 5.14v14l11-7-11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* B-Roll overlay sliding in */}
              <div className="demo-broll">
                <div className="h-full w-full bg-gradient-to-br from-[#e09145]/20 via-[#1a1a2e] to-[#3dd6c8]/10">
                  <div className="flex h-full items-center justify-center">
                    <svg viewBox="0 0 40 40" fill="none" className="h-8 w-8 text-white/20">
                      <rect x="4" y="8" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="14" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M6 28l8-6 6 4 8-8 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-[#3dd6c8]/70">Auto B-Roll</span>
                </div>
              </div>

              {/* Animated subtitles cycling through */}
              <div className="demo-subtitle demo-subtitle-1">Hello, welcome to my channel</div>
              <div className="demo-subtitle demo-subtitle-2" style={{ direction: "rtl" }}>{"\u05E9\u05DC\u05D5\u05DD, \u05D1\u05E8\u05D5\u05DB\u05D9\u05DD \u05D4\u05D1\u05D0\u05D9\u05DD \u05DC\u05E2\u05E8\u05D5\u05E5 \u05E9\u05DC\u05D9"}</div>
              <div className="demo-subtitle demo-subtitle-3">AI-powered subtitles in seconds</div>

              {/* Waveform indicator in corner */}
              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-lg bg-black/50 px-2.5 py-1.5 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">Live</span>
                <div className="waveform-container ml-1" style={{ height: 16 }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="waveform-bar text-[#e09145]"
                      style={{
                        height: "100%",
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: `${0.6 + i * 0.08}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="demo-progress">
              <div className="demo-progress-bar" />
            </div>

            {/* Controls bar */}
            <div className="flex items-center justify-between border-t border-white/[0.03] bg-white/[0.01] px-4 py-2.5">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white/30">
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
                <span className="font-mono text-[10px] text-white/20">00:12 / 01:35</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#e09145]/20 px-1.5 py-0.5 text-[8px] font-bold text-[#e09145]/80">HD</span>
                <span className="rounded bg-[#3dd6c8]/20 px-1.5 py-0.5 text-[8px] font-bold text-[#3dd6c8]/80">CC</span>
              </div>
            </div>
          </div>

          {/* Caption below demo */}
          <p className="scroll-reveal mt-6 text-center text-[13px] text-white/25">
            Watch ReelMix in action &mdash; subtitles appear in real-time, B-roll slides in automatically
          </p>
        </div>
      </section>

      {/* ═══════════════════ FEATURE SHOWCASE ═══════════════════ */}
      <section className="relative px-4 py-28 sm:py-36">
        <div className="pointer-events-none absolute inset-0 dot-grid-subtle opacity-30" />

        <div className="relative mx-auto max-w-6xl">
          <div className="scroll-reveal flex justify-center">
            <span className="section-label text-[#a78bfa]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa]" />
              See It In Action
            </span>
          </div>
          <h2 className="scroll-reveal mt-6 text-center text-3xl font-bold text-white/90 sm:text-4xl lg:text-5xl">
            Every feature,{" "}
            <span className="bg-gradient-to-r from-[#a78bfa] to-[#f472b6] bg-clip-text text-transparent">visualized</span>
          </h2>

          {/* Showcase Panel 1: Transcription */}
          <div className="scroll-reveal mt-20 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="flex items-center gap-3 text-[#e09145]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e09145]/20 bg-[#e09145]/5">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M19 10v1a7 7 0 01-14 0v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-[12px] font-bold uppercase tracking-[0.15em]">Transcription</span>
              </div>
              <h3 className="mt-5 text-2xl font-bold text-white/90 sm:text-3xl">
                Speech becomes text,<br />word by word
              </h3>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/35">
                Whisper AI listens to every word and generates perfectly-timed subtitles. Supports 50+ languages with near-human accuracy. Processing happens in seconds, not minutes.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Groq Whisper", "OpenAI Whisper", "50+ Languages", "Sub-second"].map((tag) => (
                  <span key={tag} className="rounded-lg border border-[#e09145]/15 bg-[#e09145]/5 px-3 py-1 text-[11px] font-semibold text-[#e09145]/70">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Animated transcription demo */}
            <div className="showcase-panel p-6">
              <div className="showcase-panel-glow" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(224,145,69,0.06) 0%, transparent 70%)" }} />
              <div className="relative">
                {/* Waveform visualization */}
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.015] px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e09145]/10">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-[#e09145]">
                      <path d="M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="waveform-container text-[#e09145]/60" style={{ height: 24 }}>
                      {Array.from({ length: 32 }).map((_, i) => (
                        <div
                          key={i}
                          className="waveform-bar"
                          style={{
                            height: "100%",
                            animationDelay: `${i * 0.05}s`,
                            animationDuration: `${0.5 + (i % 5) * 0.15}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-white/20">01:35</span>
                </div>

                {/* Animated subtitle lines appearing */}
                <div className="space-y-2.5">
                  {[
                    { time: "00:02", text: "Welcome to the ReelMix demo", delay: "0s" },
                    { time: "00:05", text: "Everything runs in your browser", delay: "0.8s" },
                    { time: "00:08", text: "No upload, no server, no waiting", delay: "1.6s" },
                    { time: "00:12", text: "AI generates perfect subtitles", delay: "2.4s" },
                  ].map((line, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-lg border border-white/[0.03] bg-white/[0.01] px-3 py-2.5 opacity-0"
                      style={{
                        animation: `fadeSlideUp 0.5s ease-out ${line.delay} forwards`,
                      }}
                    >
                      <span className="mt-0.5 shrink-0 font-mono text-[10px] text-[#e09145]/50">{line.time}</span>
                      <span className="text-[13px] text-white/60">{line.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Showcase Panel 2: Translation */}
          <div className="scroll-reveal mt-28 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            {/* Animated translation demo — on left this time */}
            <div className="showcase-panel order-2 p-6 lg:order-1">
              <div className="showcase-panel-glow" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(61,214,200,0.06) 0%, transparent 70%)" }} />
              <div className="relative">
                {/* Language selector mockup */}
                <div className="mb-6 flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.015] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] font-bold text-white/50">EN</span>
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[#3dd6c8]/50">
                      <path d="M5 12h14m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="rounded-md bg-[#3dd6c8]/10 px-2 py-0.5 text-[11px] font-bold text-[#3dd6c8]/70">HE</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#3dd6c8]/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#3dd6c8] animate-pulse" />
                    Translating...
                  </span>
                </div>

                {/* Translation pairs */}
                <div className="space-y-3">
                  {[
                    { en: "Welcome to my channel", he: "\u05D1\u05E8\u05D5\u05DB\u05D9\u05DD \u05D4\u05D1\u05D0\u05D9\u05DD \u05DC\u05E2\u05E8\u05D5\u05E5 \u05E9\u05DC\u05D9", delay: "0s" },
                    { en: "Today we learn editing", he: "\u05D4\u05D9\u05D5\u05DD \u05E0\u05DC\u05DE\u05D3 \u05E2\u05E8\u05D9\u05DB\u05D4", delay: "0.6s" },
                    { en: "Let's get started", he: "\u05D1\u05D5\u05D0\u05D5 \u05E0\u05EA\u05D7\u05D9\u05DC", delay: "1.2s" },
                  ].map((pair, i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-lg border border-white/[0.03] bg-white/[0.01] opacity-0"
                      style={{ animation: `fadeSlideUp 0.5s ease-out ${pair.delay} forwards` }}
                    >
                      <div className="flex items-center gap-2 border-b border-white/[0.03] px-3 py-2">
                        <span className="text-[10px] font-bold text-white/25">EN</span>
                        <span className="text-[13px] text-white/40">{pair.en}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-[#3dd6c8]/[0.02] px-3 py-2" dir="rtl">
                        <span className="text-[10px] font-bold text-[#3dd6c8]/40">HE</span>
                        <span className="text-[13px] font-medium text-[#3dd6c8]/70">{pair.he}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 text-[#3dd6c8]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#3dd6c8]/20 bg-[#3dd6c8]/5">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <circle cx="8" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="16" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <span className="text-[12px] font-bold uppercase tracking-[0.15em]">Translation</span>
              </div>
              <h3 className="mt-5 text-2xl font-bold text-white/90 sm:text-3xl">
                One click,<br />any language
              </h3>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/35">
                Gemini AI translates your subtitles naturally &mdash; not word-for-word, but how a native speaker would actually say it. Hebrew, English, and more coming soon.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Natural phrasing", "Hebrew \u2194 English", "Gemini Flash", "Colloquial"].map((tag) => (
                  <span key={tag} className="rounded-lg border border-[#3dd6c8]/15 bg-[#3dd6c8]/5 px-3 py-1 text-[11px] font-semibold text-[#3dd6c8]/70">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Showcase Panel 3: Auto B-Roll + Music */}
          <div className="scroll-reveal mt-28 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="flex items-center gap-3 text-[#a78bfa]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#a78bfa]/20 bg-[#a78bfa]/5">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 15l5-4 3 2 5-5 5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[12px] font-bold uppercase tracking-[0.15em]">B-Roll + Music</span>
              </div>
              <h3 className="mt-5 text-2xl font-bold text-white/90 sm:text-3xl">
                AI picks your visuals<br />and soundtrack
              </h3>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/35">
                ReelMix analyzes your content, extracts keywords, and automatically fetches relevant stock images, GIFs, and royalty-free music. Every overlay is timed to your narration.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Pexels Images", "GIPHY GIFs", "Pixabay Music", "AI Keywords"].map((tag) => (
                  <span key={tag} className="rounded-lg border border-[#a78bfa]/15 bg-[#a78bfa]/5 px-3 py-1 text-[11px] font-semibold text-[#a78bfa]/70">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Animated B-roll + music demo */}
            <div className="showcase-panel p-6">
              <div className="showcase-panel-glow" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.06) 0%, transparent 70%)" }} />
              <div className="relative">
                {/* Keyword extraction mockup */}
                <div className="mb-5 rounded-xl border border-white/[0.04] bg-white/[0.015] px-4 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/25">Extracted Keywords</span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["sunset", "ocean", "travel", "adventure", "mountain"].map((kw, i) => (
                      <span
                        key={kw}
                        className="rounded-md bg-[#a78bfa]/8 border border-[#a78bfa]/15 px-2 py-0.5 text-[11px] font-medium text-[#a78bfa]/60 opacity-0"
                        style={{ animation: `fadeSlideUp 0.4s ease-out ${i * 0.15}s forwards` }}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Overlay placement mockup */}
                <div className="mb-5 grid grid-cols-3 gap-2">
                  {[
                    { label: "sunset.jpg", color: "from-orange-500/20 to-amber-500/10" },
                    { label: "ocean.gif", color: "from-cyan-500/20 to-blue-500/10" },
                    { label: "mountain.jpg", color: "from-emerald-500/20 to-green-500/10" },
                  ].map((item, i) => (
                    <div
                      key={item.label}
                      className="aspect-square rounded-lg border border-white/[0.04] opacity-0"
                      style={{ animation: `scrollRevealScale 0.5s ease-out ${0.8 + i * 0.2}s forwards` }}
                    >
                      <div className={`flex h-full flex-col items-center justify-center rounded-lg bg-gradient-to-br ${item.color}`}>
                        <svg viewBox="0 0 24 24" fill="none" className="mb-1 h-5 w-5 text-white/15">
                          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                          <circle cx="8.5" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M3 16l5-4 3 2 5-5 5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span className="text-[8px] font-medium text-white/25">{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Music waveform */}
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.015] px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f59e0b]/10">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-[#f59e0b]">
                      <path d="M9 18a3 3 0 100-6 3 3 0 000 6zM21 14a3 3 0 100-6 3 3 0 000 6z" />
                      <path d="M12 15V5l12-4v10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-white/50">Sunset Vibes</p>
                    <p className="text-[9px] text-white/20">Royalty-free &middot; Pixabay</p>
                  </div>
                  <div className="flex items-end gap-[2px]" style={{ height: 20 }}>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="eq-bar"
                        style={{
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: `${0.8 + (i % 4) * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="relative px-4 py-32 sm:py-40">
        <div className="pointer-events-none absolute inset-0 dot-grid-subtle opacity-40" />

        <div className="relative mx-auto max-w-6xl">
          <div className="scroll-reveal flex justify-center">
            <span className="section-label text-[#e09145]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e09145]" />
              How It Works
            </span>
          </div>
          <h2 className="scroll-reveal mt-6 text-center text-3xl font-bold text-white/90 sm:text-4xl lg:text-5xl">
            From raw footage to{" "}
            <span className="bg-gradient-to-r from-[#e09145] to-[#f0b678] bg-clip-text text-transparent">final cut</span>
          </h2>

          <div className="relative mt-24 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {/* Animated dashed connectors (desktop) */}
            <svg
              className="pointer-events-none absolute top-[52px] left-0 hidden h-[2px] w-full lg:block"
              preserveAspectRatio="none"
            >
              {[0, 1, 2].map((i) => {
                const x1 = `${14 + i * 25}%`;
                const x2 = `${36 + i * 25}%`;
                const stroke =
                  i === 0
                    ? "rgba(224,145,69,0.25)"
                    : i === 1
                    ? "rgba(168,85,247,0.25)"
                    : "rgba(61,214,200,0.25)";
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1="50%"
                    x2={x2}
                    y2="50%"
                    className="flow-line scroll-reveal"
                    stroke={stroke}
                    strokeWidth="2"
                    strokeDasharray="6 6"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                );
              })}
            </svg>

            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="scroll-reveal group flex flex-col items-center text-center"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="relative flex h-[108px] w-[108px] items-center justify-center rounded-3xl border border-white/[0.05] bg-white/[0.015] text-white/40 transition-all duration-500 group-hover:border-white/[0.12] group-hover:bg-white/[0.04] group-hover:text-white/80 group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
                  {step.icon}
                  <span className="absolute -top-2.5 -right-2.5 flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-[#0a0a0f] font-mono text-[10px] font-bold text-white/25 shadow-lg">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#e09145]/[0.05] to-[#3dd6c8]/[0.03] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-white/85">{step.title}</h3>
                <p className="mt-2 max-w-[200px] text-[14px] leading-relaxed text-white/30">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES GRID ═══════════════════ */}
      <section className="relative px-4 py-32 sm:py-40">
        <div className="mx-auto max-w-6xl">
          <div className="scroll-reveal flex justify-center">
            <span className="section-label text-[#3dd6c8]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3dd6c8]" />
              Features
            </span>
          </div>
          <h2 className="scroll-reveal mt-6 text-center text-3xl font-bold text-white/90 sm:text-4xl lg:text-5xl">
            Built for{" "}
            <span className="bg-gradient-to-r from-[#3dd6c8] to-[#a78bfa] bg-clip-text text-transparent">creators</span>
          </h2>

          <div className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="scroll-reveal-scale card-gradient-border group relative p-8"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="feature-glow" style={{ background: f.accent }} />
                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] text-white/40 transition-all duration-400 group-hover:border-transparent group-hover:shadow-lg">
                    <span
                      className="transition-colors duration-400"
                      style={{ color: "inherit" }}
                      ref={(el) => {
                        if (!el) return;
                        const parent = el.closest(".group");
                        if (!parent) return;
                        parent.addEventListener("mouseenter", () => {
                          el.style.color = f.accent;
                        });
                        parent.addEventListener("mouseleave", () => {
                          el.style.color = "";
                        });
                      }}
                    >
                      {f.icon}
                    </span>
                  </div>
                  <h3 className="text-[18px] font-semibold text-white/90">{f.title}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-white/35">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section className="relative px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="scroll-reveal grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {[
              { number: "50+", label: "Languages", accent: "#e09145" },
              { number: "100%", label: "Browser-based", accent: "#3dd6c8" },
              { number: "0", label: "Server uploads", accent: "#a78bfa" },
              { number: "<30s", label: "Processing time", accent: "#f472b6" },
            ].map((stat) => (
              <div key={stat.label} className="stat-card scroll-reveal-scale">
                <p className="stat-number" style={{ color: stat.accent }}>{stat.number}</p>
                <p className="mt-2 text-[13px] font-medium text-white/35">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ ABOUT US ═══════════════════ */}
      <section className="relative px-4 py-28 sm:py-36">
        <div className="pointer-events-none absolute inset-0 dot-grid-subtle opacity-25" />

        <div className="relative mx-auto max-w-6xl">
          <div className="scroll-reveal flex justify-center">
            <span className="section-label text-[#f472b6]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f472b6]" />
              About Us
            </span>
          </div>
          <h2 className="scroll-reveal mt-6 text-center text-3xl font-bold text-white/90 sm:text-4xl lg:text-5xl">
            Built by creators,{" "}
            <span className="bg-gradient-to-r from-[#f472b6] to-[#e09145] bg-clip-text text-transparent">for creators</span>
          </h2>
          <p className="scroll-reveal mx-auto mt-6 max-w-2xl text-center text-[16px] leading-relaxed text-white/35">
            ReelMix was born from a simple frustration: video editing tools are either too complex, too expensive, or require uploading your content to someone else&apos;s servers. We believe your creative workflow should be instant, private, and powerful &mdash; right in your browser.
          </p>

          {/* Values grid */}
          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              {
                title: "Privacy First",
                desc: "Your videos never leave your browser. All processing happens locally using WebAssembly and client-side AI. No upload, no server, no risk.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                    <path d="M12 2l8 4v6c0 5.5-3.8 10.7-8 12-4.2-1.3-8-6.5-8-12V6l8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                accent: "#3dd6c8",
              },
              {
                title: "AI-Powered",
                desc: "We combine the best AI models — Whisper for transcription, Gemini for translation, and smart keyword extraction — to automate the tedious parts of editing.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 6v2m0 8v2M6 12h2m8 0h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                ),
                accent: "#e09145",
              },
              {
                title: "Open & Free",
                desc: "No paywall, no watermarks, no limits. ReelMix is built for the community. We believe great tools should be accessible to every creator, everywhere.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="9" cy="10" r="1" fill="currentColor" />
                    <circle cx="15" cy="10" r="1" fill="currentColor" />
                  </svg>
                ),
                accent: "#a78bfa",
              },
            ].map((value) => (
              <div key={value.title} className="scroll-reveal-scale about-value-card">
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border bg-opacity-5"
                  style={{
                    borderColor: `${value.accent}25`,
                    background: `${value.accent}08`,
                    color: value.accent,
                  }}
                >
                  {value.icon}
                </div>
                <h3 className="text-[17px] font-bold text-white/85">{value.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-white/30">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ POWERED BY ═══════════════════ */}
      <section className="relative overflow-hidden px-4 py-28">
        <div className="pointer-events-none absolute inset-0 dot-grid-subtle opacity-30" />

        <div className="relative mx-auto max-w-5xl">
          <div className="scroll-reveal flex justify-center">
            <span className="section-label text-white/25">
              <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
              Powered By
            </span>
          </div>

          <div className="scroll-reveal mt-12 flex flex-wrap items-center justify-center gap-3">
            {TECH.map((name) => (
              <span key={name} className="tech-chip">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ BOTTOM CTA ═══════════════════ */}
      <section className="cta-gradient relative px-4 py-32 sm:py-40">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />

        <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
          <h2 className="scroll-reveal text-3xl font-bold text-white/90 sm:text-4xl lg:text-5xl">
            Your next video
            <br />
            <span className="text-gradient-animated">
              starts here
            </span>
          </h2>
          <p className="scroll-reveal mt-6 max-w-md text-[17px] leading-relaxed text-white/35">
            Professional subtitles, B-roll, and music&nbsp;&mdash; in minutes.
          </p>
          <div className="scroll-reveal mt-14">
            <Link
              href={isLoggedIn ? "/editor" : "/register"}
              className="btn-glow group inline-flex h-16 items-center justify-center gap-3 rounded-2xl px-14 text-[15px] font-semibold text-white"
            >
              {isLoggedIn ? "Open Editor" : "Start Creating \u2014 It\u2019s Free"}
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="relative border-t border-white/[0.04]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e09145]/25 to-transparent" />

        <div className="mx-auto max-w-6xl px-6 pt-24 pb-12">
          <div className="mb-20 flex flex-col items-start justify-between gap-10 sm:flex-row sm:items-center">
            <div>
              <Link href="/" className="group inline-flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#e09145] via-[#d47f38] to-[#c06a20] shadow-lg shadow-[#e09145]/15 transition-transform duration-300 group-hover:scale-105">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-white">
                    <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-7.5A2.25 2.25 0 0010.75 4h-7.5zM19 4.75a.75.75 0 00-1.28-.53l-3 3a.75.75 0 00-.22.53v4.5c0 .199.079.39.22.53l3 3A.75.75 0 0019 15.25v-10.5z" />
                  </svg>
                </div>
                <span className="text-[19px] font-bold tracking-tight text-white/90">
                  Reel<span className="bg-gradient-to-r from-[#e09145] to-[#f0b678] bg-clip-text text-transparent">Mix</span>
                </span>
              </Link>
              <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-white/30">
                AI subtitles, auto B-roll, music, and video layouts &mdash; mixed and exported entirely in your browser.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {[
                { label: "Twitter / X", icon: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /> },
                { label: "GitHub", icon: <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /> },
                { label: "Discord", icon: <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /> },
              ].map((social) => (
                <a key={social.label} href="#" className="group flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.015] transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]" aria-label={social.label}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5 text-white/25 transition-colors duration-300 group-hover:text-white/65">
                    {social.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 sm:grid-cols-3 lg:grid-cols-4">
            <div>
              <h4 className="mb-6 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">Product</h4>
              <ul className="space-y-3.5">
                {[{ href: "/editor", label: "Video Editor" }, { href: "/calendar", label: "Content Calendar" }, { href: "/register", label: "Sign Up" }].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="group inline-flex items-center gap-2 text-[14px] text-white/30 transition-colors duration-200 hover:text-white/70">
                      {link.label}
                      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5"><path fillRule="evenodd" d="M6.22 4.22a.75.75 0 011.06 0l3.25 3.25a.75.75 0 010 1.06l-3.25 3.25a.75.75 0 01-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-6 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">Capabilities</h4>
              <ul className="space-y-3.5">
                {["AI Transcription", "Smart Translation", "Auto B-Roll", "YouTube Import", "Music Mixing"].map((item) => (
                  <li key={item} className="text-[14px] text-white/30">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-6 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">Stack</h4>
              <ul className="space-y-3.5">
                {["Next.js + React", "FFmpeg.wasm", "Whisper (Groq / OpenAI)", "Gemini Flash", "Pexels + Giphy"].map((item) => (
                  <li key={item} className="text-[14px] text-white/30">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-6 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">Resources</h4>
              <ul className="space-y-3.5">
                {["Documentation", "API Reference", "Changelog", "Status"].map((item) => (
                  <li key={item}><span className="text-[14px] text-white/30">{item}</span></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative mt-20">
            <div className="h-px bg-white/[0.04]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-6">
              <p className="text-[13px] text-white/20">&copy; {new Date().getFullYear()} ReelMix</p>
              <span className="hidden h-3.5 w-px bg-white/[0.06] sm:block" />
              <span className="text-[13px] text-white/20 transition-colors duration-200 hover:text-white/40 cursor-pointer">Privacy</span>
              <span className="text-[13px] text-white/20 transition-colors duration-200 hover:text-white/40 cursor-pointer">Terms</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="glass-premium flex items-center gap-2.5 rounded-full px-4 py-2 text-[11px] font-medium text-[#3dd6c8]/60">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3dd6c8] opacity-30" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3dd6c8]" />
                </span>
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
