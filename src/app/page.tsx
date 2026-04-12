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
    accent: "#a855f7",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
        <rect x="3" y="6" width="26" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <rect x="7" y="10" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="14" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="#050507" />
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
    accent: "#ec4899",
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
    desc: "Drop your video — any format, any length.",
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
        <circle cx="28" cy="10" r="4" fill="#050507" stroke="currentColor" strokeWidth="1.2" />
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
        <rect x="16" y="18" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" fill="#050507" />
        <path d="M18 32l5-6 3 3 5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="22" cy="23" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Export",
    desc: "Burned subtitles, overlays, music — done.",
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

const PARTICLES = Array.from({ length: 50 }, (_, i) => ({
  left: `${(i * 13 + 7) % 100}%`,
  top: `${(i * 19 + 3) % 100}%`,
  delay: `${(i * 0.6) % 8}s`,
  size: i % 4 === 0 ? 3 : 2,
  duration: 4 + (i % 5),
}));

/* ─── Component ───────────────────────────────────────────────────────── */

export default function Home() {
  const { isSignedIn, user } = useUser();
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
      <section className="hero-gradient relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
        {/* Animated gradient mesh */}
        <div className="mesh-bg pointer-events-none absolute -top-60 -left-60 h-[700px] w-[700px] rounded-full bg-[#e09145]/[0.06] blur-[140px]" />
        <div
          className="mesh-bg pointer-events-none absolute -right-40 top-10 h-[600px] w-[600px] rounded-full bg-[#3dd6c8]/[0.04] blur-[120px]"
          style={{ animationDelay: "-7s" }}
        />
        <div
          className="mesh-bg pointer-events-none absolute bottom-0 left-1/4 h-[500px] w-[800px] rounded-full bg-purple-500/[0.03] blur-[130px]"
          style={{ animationDelay: "-14s" }}
        />

        {/* Floating particles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white/[0.12]"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animation: `floatParticle ${p.duration}s ease-in-out infinite`,
                animationDelay: p.delay,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Status badge */}
          <div className="animate-fade-up flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[#3dd6c8] animate-pulse" />
            <span className="text-xs font-medium tracking-wide text-white/50">
              {isLoggedIn
                ? `Welcome back, ${user?.firstName || user?.emailAddresses?.[0]?.emailAddress || ""}`
                : "100% browser-based · No install needed"}
            </span>
          </div>

          {/* Main headline */}
          <h1 className="animate-fade-up stagger-1 mt-10 max-w-3xl text-center text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="text-white/90">Auto-subtitle</span>
            <br />
            <span className="bg-gradient-to-r from-[#e09145] via-[#f0b678] to-[#3dd6c8] bg-clip-text text-transparent">
              any video.
            </span>
          </h1>

          {/* Subtext */}
          <p className="animate-fade-up stagger-2 mt-7 max-w-xl text-center text-base leading-relaxed text-white/40 sm:text-lg">
            AI transcription. Smart translation. Auto B-roll. Music.
            <br className="hidden sm:block" />
            All burned in&nbsp;&mdash; right in your browser.
          </p>

          {/* CTA buttons */}
          <div className="animate-fade-up stagger-3 mt-12 flex flex-col gap-4 sm:flex-row">
            {isLoggedIn ? (
              <>
                <Link
                  href="/editor"
                  className="btn-glow inline-flex h-14 items-center justify-center rounded-2xl px-10 text-base font-semibold text-white"
                >
                  Open Editor
                </Link>
                <Link
                  href="/calendar"
                  className="btn-secondary inline-flex h-14 items-center justify-center rounded-2xl px-10 text-base font-semibold text-white/70"
                >
                  Content Calendar
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="btn-glow inline-flex h-14 items-center justify-center rounded-2xl px-10 text-base font-semibold text-white"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/login"
                  className="btn-secondary inline-flex h-14 items-center justify-center rounded-2xl px-10 text-base font-semibold text-white/70"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Trust signals */}
          <div className="animate-fade-up stagger-4 mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-white/25">
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-[#3dd6c8]/60"><path d="M8 1.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13zm2.854 4.146a.5.5 0 00-.708 0L7 8.793 5.854 7.646a.5.5 0 10-.708.708l1.5 1.5a.5.5 0 00.708 0l3.5-3.5a.5.5 0 000-.708z" /></svg>
              No watermark
            </span>
            <span className="text-white/10">·</span>
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-[#3dd6c8]/60"><path d="M8 1.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13zm2.854 4.146a.5.5 0 00-.708 0L7 8.793 5.854 7.646a.5.5 0 10-.708.708l1.5 1.5a.5.5 0 00.708 0l3.5-3.5a.5.5 0 000-.708z" /></svg>
              No signup required
            </span>
            <span className="text-white/10">·</span>
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-[#3dd6c8]/60"><path d="M8 1.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13zm2.854 4.146a.5.5 0 00-.708 0L7 8.793 5.854 7.646a.5.5 0 10-.708.708l1.5 1.5a.5.5 0 00.708 0l3.5-3.5a.5.5 0 000-.708z" /></svg>
              100% browser-based
            </span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-up stagger-5">
          <div className="flex flex-col items-center gap-2 text-white/15">
            <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
            <svg viewBox="0 0 16 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-3 animate-bounce">
              <rect x="1" y="1" width="14" height="22" rx="7" />
              <circle cx="8" cy="7" r="1.5" fill="currentColor" />
            </svg>
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="relative px-4 py-28 sm:py-36">
        <div className="mx-auto max-w-6xl">
          <p className="scroll-reveal text-center text-sm font-semibold uppercase tracking-[0.2em] text-[#e09145]">
            How It Works
          </p>
          <h2 className="scroll-reveal mt-4 text-center text-3xl font-bold text-white/90 sm:text-4xl lg:text-5xl">
            From raw footage to final cut
          </h2>

          <div className="relative mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
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
                    ? "rgba(224,145,69,0.3)"
                    : i === 1
                    ? "rgba(168,85,247,0.3)"
                    : "rgba(61,214,200,0.3)";
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
                <div className="relative flex h-[104px] w-[104px] items-center justify-center rounded-3xl border border-white/[0.06] bg-white/[0.02] text-white/50 transition-all duration-500 group-hover:border-white/[0.12] group-hover:bg-white/[0.04] group-hover:text-white/80">
                  {step.icon}
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-[#0a0a0f] font-mono text-[10px] text-white/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white/85">{step.title}</h3>
                <p className="mt-2 max-w-[200px] text-sm leading-relaxed text-white/35">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section className="px-4 py-28 sm:py-36">
        <div className="mx-auto max-w-6xl">
          <p className="scroll-reveal text-center text-sm font-semibold uppercase tracking-[0.2em] text-[#3dd6c8]">
            Features
          </p>
          <h2 className="scroll-reveal mt-4 text-center text-3xl font-bold text-white/90 sm:text-4xl lg:text-5xl">
            Built for creators
          </h2>

          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="scroll-reveal-scale glass group relative overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05]"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Accent glow on hover */}
                <div
                  className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full opacity-0 blur-[80px] transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: f.accent }}
                />
                <div className="relative">
                  <div
                    className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-white/50 transition-all duration-300 group-hover:border-transparent group-hover:shadow-lg"
                    style={{
                      ["--accent" as string]: f.accent,
                    }}
                  >
                    <span
                      className="transition-colors duration-300"
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
                  <h3 className="text-lg font-semibold text-white/90">{f.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/40">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ POWERED BY ═══════════════════ */}
      <section className="overflow-hidden px-4 py-28">
        <div className="mx-auto max-w-5xl">
          <p className="scroll-reveal mb-12 text-center text-xs font-semibold uppercase tracking-[0.25em] text-white/20">
            Powered by
          </p>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-[#050507] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-[#050507] to-transparent" />

            <div className="overflow-hidden">
              <div className="logo-strip flex w-max items-center gap-16">
                {[...TECH, ...TECH].map((name, i) => (
                  <span
                    key={`${name}-${i}`}
                    className="whitespace-nowrap text-base font-semibold text-white/[0.12] transition-colors duration-300 hover:text-white/40"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ BOTTOM CTA ═══════════════════ */}
      <section className="cta-gradient px-4 py-28 sm:py-36">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h2 className="scroll-reveal text-3xl font-bold text-white/90 sm:text-4xl lg:text-5xl">
            Your next video
            <br />
            <span className="bg-gradient-to-r from-[#e09145] to-[#3dd6c8] bg-clip-text text-transparent">
              starts here
            </span>
          </h2>
          <p className="scroll-reveal mt-5 max-w-md text-base leading-relaxed text-white/40">
            Professional subtitles, B-roll, and music&nbsp;&mdash; in minutes.
          </p>
          <div className="scroll-reveal mt-12">
            <Link
              href={isLoggedIn ? "/editor" : "/register"}
              className="btn-glow group inline-flex h-16 items-center justify-center gap-3 rounded-2xl px-12 text-base font-semibold text-white"
            >
              {isLoggedIn ? "Open Editor" : "Start Creating — It's Free"}
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
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
      <footer className="relative border-t border-white/[0.06]">
        {/* Subtle top gradient */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e09145]/20 to-transparent" />

        <div className="mx-auto max-w-6xl px-6 pt-20 pb-10 sm:pt-24">
          {/* Top section: CTA + Newsletter */}
          <div className="mb-16 flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div>
              <Link href="/" className="group inline-flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#e09145] to-[#c47a30] shadow-lg shadow-[#e09145]/15 transition-transform group-hover:scale-105">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5 text-white">
                    <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-7.5A2.25 2.25 0 0010.75 4h-7.5zM19 4.75a.75.75 0 00-1.28-.53l-3 3a.75.75 0 00-.22.53v4.5c0 .199.079.39.22.53l3 3A.75.75 0 0019 15.25v-10.5z" />
                  </svg>
                </div>
                <span className="text-[18px] font-bold tracking-tight text-white/90">
                  Reel<span className="bg-gradient-to-r from-[#e09145] to-[#f0b678] bg-clip-text text-transparent">Mix</span>
                </span>
              </Link>
              <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-white/35">
                AI subtitles, auto B-roll, music, and video layouts — mixed and exported entirely in your browser.
              </p>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              <a href="#" className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all hover:border-white/[0.12] hover:bg-white/[0.05]" aria-label="Twitter / X">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white/30 transition-colors group-hover:text-white/70">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all hover:border-white/[0.12] hover:bg-white/[0.05]" aria-label="GitHub">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5 text-white/30 transition-colors group-hover:text-white/70">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a href="#" className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all hover:border-white/[0.12] hover:bg-white/[0.05]" aria-label="Discord">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5 text-white/30 transition-colors group-hover:text-white/70">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-4">
            <div>
              <h4 className="mb-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Product
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/editor" className="group inline-flex items-center gap-1.5 text-[14px] text-white/35 transition hover:text-white/70">
                    Video Editor
                    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"><path fillRule="evenodd" d="M6.22 4.22a.75.75 0 011.06 0l3.25 3.25a.75.75 0 010 1.06l-3.25 3.25a.75.75 0 01-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
                  </Link>
                </li>
                <li>
                  <Link href="/calendar" className="group inline-flex items-center gap-1.5 text-[14px] text-white/35 transition hover:text-white/70">
                    Content Calendar
                    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"><path fillRule="evenodd" d="M6.22 4.22a.75.75 0 011.06 0l3.25 3.25a.75.75 0 010 1.06l-3.25 3.25a.75.75 0 01-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="group inline-flex items-center gap-1.5 text-[14px] text-white/35 transition hover:text-white/70">
                    Sign Up
                    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"><path fillRule="evenodd" d="M6.22 4.22a.75.75 0 011.06 0l3.25 3.25a.75.75 0 010 1.06l-3.25 3.25a.75.75 0 01-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Capabilities
              </h4>
              <ul className="space-y-3">
                <li className="text-[14px] text-white/35">AI Transcription</li>
                <li className="text-[14px] text-white/35">Smart Translation</li>
                <li className="text-[14px] text-white/35">Auto B-Roll</li>
                <li className="text-[14px] text-white/35">YouTube Import</li>
                <li className="text-[14px] text-white/35">Music Mixing</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Stack
              </h4>
              <ul className="space-y-3">
                <li className="text-[14px] text-white/35">Next.js + React</li>
                <li className="text-[14px] text-white/35">FFmpeg.wasm</li>
                <li className="text-[14px] text-white/35">Whisper (Groq / OpenAI)</li>
                <li className="text-[14px] text-white/35">Gemini Flash</li>
                <li className="text-[14px] text-white/35">Pexels + Giphy</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Resources
              </h4>
              <ul className="space-y-3">
                <li><span className="text-[14px] text-white/35">Documentation</span></li>
                <li><span className="text-[14px] text-white/35">API Reference</span></li>
                <li><span className="text-[14px] text-white/35">Changelog</span></li>
                <li><span className="text-[14px] text-white/35">Status</span></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="relative mt-16">
            <div className="h-px bg-white/[0.06]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          </div>

          {/* Bottom bar */}
          <div className="mt-8 flex flex-col items-center justify-between gap-5 sm:flex-row">
            <div className="flex items-center gap-5">
              <p className="text-[13px] text-white/20">
                &copy; {new Date().getFullYear()} ReelMix
              </p>
              <span className="hidden h-3 w-px bg-white/[0.08] sm:block" />
              <span className="text-[13px] text-white/20 transition hover:text-white/40 cursor-pointer">Privacy</span>
              <span className="text-[13px] text-white/20 transition hover:text-white/40 cursor-pointer">Terms</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 rounded-full border border-[#3dd6c8]/15 bg-[#3dd6c8]/5 px-3 py-1.5 text-[11px] font-medium text-[#3dd6c8]/70">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3dd6c8] opacity-40" />
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
