import type { Metadata, Viewport } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "SubsAI — Hebrew Video Subtitles",
  description:
    "Transcribe, translate to Hebrew, and burn subtitles into your videos with AI",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050507",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="ltr"
      className={`${outfit.variable} ${jetbrains.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
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
            <div className="flex gap-0.5">
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
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
