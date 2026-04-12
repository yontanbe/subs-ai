"use client";

import { useState } from "react";
import type { MediaItem } from "@/types";

interface Props {
  items: MediaItem[];
  isLoading: boolean;
  onFetch: (keywords: string) => void;
  onAddAsOverlay?: (imageUrl: string) => void;
}

type Tab = "all" | "ai" | "image" | "gif";

export default function MediaSuggestions({ items, isLoading, onFetch, onAddAsOverlay }: Props) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  const filtered =
    tab === "all" ? items : items.filter((i) => i.type === tab);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "all", label: "All", icon: "◈" },
    { key: "ai", label: "AI", icon: "✦" },
    { key: "image", label: "Photos", icon: "◻" },
    { key: "gif", label: "GIFs", icon: "▶" },
  ];

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-purple-400">
            <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909-4.97-4.969a.75.75 0 00-1.06 0L2.5 11.06z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-[13px] font-semibold text-white/80">Media</h3>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && query && onFetch(query)}
          placeholder="Search keywords…"
          className="input-glass flex-1 rounded-xl px-3 py-2 text-[13px] text-white/80 placeholder:text-white/25"
        />
        <button
          onClick={() => query && onFetch(query)}
          disabled={isLoading || !query}
          className="btn-secondary flex h-[38px] w-[38px] items-center justify-center rounded-xl disabled:opacity-40"
        >
          {isLoading ? (
            <span className="spinner" />
          ) : (
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white/50">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex rounded-xl border border-white/[0.06] bg-white/[0.02] p-0.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg py-1.5 text-[11px] font-medium transition-all duration-200 ${
              tab === t.key
                ? "bg-white/[0.08] text-white/80 shadow-sm"
                : "text-white/30 hover:text-white/50"
            }`}
          >
            <span className="mr-1 text-[9px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-3 gap-1.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-white/[0.04] transition-all duration-200 hover:border-white/[0.12] hover:scale-[1.03]"
            >
              <img
                src={item.thumbnailUrl}
                alt={item.alt}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-1.5 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-medium text-white/70 backdrop-blur-sm">
                  {item.source}
                </span>
                {onAddAsOverlay && (item.type === "image" || item.type === "gif") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddAsOverlay(item.url);
                    }}
                    className="rounded bg-[#3dd6c8]/80 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm transition hover:bg-[#3dd6c8]"
                  >
                    + Overlay
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-2 text-lg text-white/10">◈</div>
            <p className="text-[11px] text-white/25">
              Search keywords to find images
            </p>
          </div>
        )
      )}
    </div>
  );
}
