"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function NavBar() {
  const { data: session, status } = useSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050507]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#e09145] to-[#c47a30]">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5 text-white"
            >
              <path d="M3.5 3A1.5 1.5 0 002 4.5v3.585a1.5 1.5 0 00.44 1.06l6.293 6.294a1.5 1.5 0 002.122 0l3.585-3.585a1.5 1.5 0 000-2.122L8.146 3.94A1.5 1.5 0 007.086 3.5H3.5z" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white/90 transition group-hover:text-white">
            Subs
            <span className="bg-gradient-to-r from-[#e09145] to-[#f0b678] bg-clip-text text-transparent">
              AI
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {status === "authenticated" ? (
            <>
              <Link
                href="/editor"
                className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-white/50 transition hover:bg-white/[0.06] hover:text-white/80"
              >
                Editor
              </Link>
              <Link
                href="/calendar"
                className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-white/50 transition hover:bg-white/[0.06] hover:text-white/80"
              >
                Calendar
              </Link>
              <div className="ml-2 flex items-center gap-2 border-l border-white/[0.06] pl-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e09145]/15 text-[11px] font-bold text-[#e09145]">
                  {session.user?.name?.[0]?.toUpperCase() ||
                    session.user?.email?.[0]?.toUpperCase() ||
                    "?"}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-lg px-2 py-1 text-[12px] text-white/30 transition hover:bg-white/[0.06] hover:text-white/60"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : status === "loading" ? (
            <div className="h-4 w-20 rounded shimmer" />
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-white/50 transition hover:bg-white/[0.06] hover:text-white/80"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="btn-glow rounded-lg px-4 py-1.5 text-[12px] font-semibold text-white"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
