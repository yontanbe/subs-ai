"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTranslation } from "@/lib/i18n";
import { useEffect, useState } from "react";

export default function NavBar() {
  const { data: session, status } = useSession();
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
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.06] bg-[#050507]/80 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#e09145] to-[#c47a30] shadow-lg shadow-[#e09145]/20 transition-transform duration-200 group-hover:scale-105">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white">
              <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-7.5A2.25 2.25 0 0010.75 4h-7.5zM19 4.75a.75.75 0 00-1.28-.53l-3 3a.75.75 0 00-.22.53v4.5c0 .199.079.39.22.53l3 3A.75.75 0 0019 15.25v-10.5z" />
            </svg>
          </div>
          <span className="text-[16px] font-bold tracking-tight text-white/90 transition-colors group-hover:text-white">
            Reel<span className="bg-gradient-to-r from-[#e09145] to-[#f0b678] bg-clip-text text-transparent">Mix</span>
          </span>
        </Link>

        {/* Center nav — visible when logged in */}
        {status === "authenticated" && (
          <div className="hidden items-center gap-0.5 rounded-full border border-white/[0.06] bg-white/[0.02] p-1 sm:flex">
            <Link
              href="/editor"
              className="rounded-full px-4 py-1.5 text-[13px] font-medium text-white/50 transition-all hover:bg-white/[0.06] hover:text-white/80"
            >
              {t("nav.editor")}
            </Link>
            <Link
              href="/calendar"
              className="rounded-full px-4 py-1.5 text-[13px] font-medium text-white/50 transition-all hover:bg-white/[0.06] hover:text-white/80"
            >
              {t("nav.calendar")}
            </Link>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={toggleLocale}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.02] text-[11px] font-bold text-white/40 transition-all hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-white/70"
            title={locale === "en" ? "Switch to Hebrew" : "Switch to English"}
          >
            {locale === "en" ? "עב" : "EN"}
          </button>

          {status === "authenticated" ? (
            <div className="flex items-center gap-2">
              {/* Mobile nav links */}
              <div className="flex items-center gap-0.5 sm:hidden">
                <Link
                  href="/editor"
                  className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-white/50 transition hover:text-white/80"
                >
                  {t("nav.editor")}
                </Link>
              </div>

              {/* User avatar + sign out */}
              <div className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] py-1 pl-1 pr-3 transition-colors hover:border-white/[0.1]">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#e09145] to-[#d07a2f] text-[11px] font-bold text-white shadow-sm">
                  {session.user?.name?.[0]?.toUpperCase() ||
                    session.user?.email?.[0]?.toUpperCase() ||
                    "?"}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-[12px] font-medium text-white/40 transition hover:text-white/70"
                >
                  {t("nav.signOut")}
                </button>
              </div>
            </div>
          ) : status === "loading" ? (
            <div className="h-8 w-24 animate-pulse rounded-full bg-white/[0.04]" />
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2 text-[13px] font-medium text-white/50 transition-all hover:bg-white/[0.04] hover:text-white/80 sm:inline-flex"
              >
                {t("nav.signIn")}
              </Link>
              <Link
                href="/register"
                className="group relative inline-flex h-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#e09145] to-[#d07a2f] px-5 text-[13px] font-semibold text-white shadow-lg shadow-[#e09145]/20 transition-all duration-200 hover:shadow-[#e09145]/30 hover:brightness-110"
              >
                <span className="relative z-10">{t("nav.getStarted")}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
