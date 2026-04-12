import type { Metadata, Viewport } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import NavBar from "@/components/NavBar";
import Providers from "@/components/Providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "ReelMix — AI Video Studio",
  description:
    "Subtitles, B-roll, music, and layouts — mixed and burned into your video with AI, right in the browser.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#030305",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${manrope.variable} ${jetbrains.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#e09145",
              colorBackground: "#0a0a0f",
              colorInputBackground: "#111118",
              colorInputText: "#ffffffdd",
              colorText: "#ffffffdd",
              colorTextSecondary: "#ffffff80",
              colorNeutral: "#ffffff",
              borderRadius: "0.75rem",
            },
            elements: {
              card: "bg-[#0a0a0f] border border-white/[0.06] shadow-2xl",
              socialButtonsBlockButton:
                "bg-white/[0.04] border-white/[0.08] text-white/80 hover:bg-white/[0.08]",
              formFieldInput:
                "bg-[#111118] border-white/[0.08] text-white/90 placeholder:text-white/25",
              footerActionLink: "text-[#e09145] hover:text-[#f0b678]",
              headerTitle: "text-white/90",
              headerSubtitle: "text-white/40",
              dividerLine: "bg-white/[0.06]",
              dividerText: "text-white/30",
              formButtonPrimary:
                "bg-gradient-to-r from-[#e09145] to-[#d07a2f] hover:brightness-110 shadow-lg shadow-[#e09145]/20",
            },
          }}
        >
          <Providers>
            <NavBar />
            <main className="flex-1">{children}</main>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
