"use client";

import Link from "next/link";
import { Show, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useTranslation } from "@/lib/i18n";
import { useEffect, useState } from "react";

export default function NavBar() {
  const { t, locale, setLocale } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleLocale = () => setLocale(locale === "en" ? "he" : "en");

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "nav-glass shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5 sm:px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#e09145] via-[#d47f38] to-[#c06a20] shadow-lg shadow-[#e09145]/25 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[#e09145]/40 group-hover:shadow-xl">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5 text-white">
              <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-7.5A2.25 2.25 0 0010.75 4h-7.5zM19 4.75a.75.75 0 00-1.28-.53l-3 3a.75.75 0 00-.22.53v4.5c0 .199.079.39.22.53l3 3A.75.75 0 0019 15.25v-10.5z" />
            </svg>
            {/* Subtle ring glow on hover */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#e09145] to-[#f0b678] opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-40" />
          </div>
          <span className="text-[17px] font-bold tracking-tight text-white/90 transition-colors duration-200 group-hover:text-white">
            Reel<span className="bg-gradient-to-r from-[#e09145] via-[#f0b678] to-[#e09145] bg-[length:200%_100%] bg-clip-text text-transparent">Mix</span>
          </span>
        </Link>

        {/* Center nav — visible when signed in */}
        <Show when="signed-in">
          <div className="hidden items-center gap-0.5 rounded-full border border-white/[0.05] bg-white/[0.015] p-1 backdrop-blur-sm sm:flex">
            <Link
              href="/editor"
              className="rounded-full px-5 py-2 text-[13px] font-medium text-white/40 transition-all duration-200 hover:bg-white/[0.06] hover:text-white/85"
            >
              {t("nav.editor")}
            </Link>
            <Link
              href="/calendar"
              className="rounded-full px-5 py-2 text-[13px] font-medium text-white/40 transition-all duration-200 hover:bg-white/[0.06] hover:text-white/85"
            >
              {t("nav.calendar")}
            </Link>
          </div>
        </Show>

        {/* Right side */}
        <div className="flex items-center gap-2.5">
          {/* Language toggle */}
          <button
            onClick={toggleLocale}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.02] text-[11px] font-bold text-white/35 transition-all duration-200 hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white/70 hover:shadow-[0_0_12px_rgba(224,145,69,0.08)]"
            title={locale === "en" ? "Switch to Hebrew" : "Switch to English"}
          >
            {locale === "en" ? "\u05E2\u05D1" : "EN"}
          </button>

          <Show when="signed-in">
            <div className="flex items-center gap-2.5">
              {/* Mobile nav links */}
              <div className="flex items-center gap-0.5 sm:hidden">
                <Link
                  href="/editor"
                  className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-white/50 transition hover:text-white/80"
                >
                  {t("nav.editor")}
                </Link>
              </div>

              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 ring-2 ring-white/[0.06] ring-offset-2 ring-offset-[#030305]",
                  },
                }}
              />
            </div>
          </Show>

          <Show when="signed-out">
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button className="hidden rounded-full px-5 py-2 text-[13px] font-medium text-white/45 transition-all duration-200 hover:bg-white/[0.04] hover:text-white/80 sm:inline-flex">
                  {t("nav.signIn")}
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="group relative inline-flex h-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#e09145] via-[#d47f38] to-[#c06a20] px-6 text-[13px] font-semibold text-white shadow-lg shadow-[#e09145]/20 transition-all duration-300 hover:shadow-[#e09145]/35 hover:shadow-xl hover:brightness-110">
                  <span className="relative z-10">{t("nav.getStarted")}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent -translate-x-full transition-transform duration-700 group-hover:translate-x-full" />
                </button>
              </SignUpButton>
            </div>
          </Show>
        </div>
      </div>
    </nav>
  );
}
