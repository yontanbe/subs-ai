"use client";

import { useState } from "react";
import type { MediaItem } from "@/types";

interface Props {
  items: MediaItem[];
  isLoading: boolean;
  onFetch: (keywords: string) => void;
}

type Tab = "all" | "ai" | "image" | "gif";

export default function MediaSuggestions({ items, isLoading, onFetch }: Props) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  const filtered =
    tab === "all" ? items : items.filter((i) => i.type === tab);

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "ai", label: "AI Generated" },
    { key: "image", label: "Photos" },
    { key: "gif", label: "GIFs" },
  ];

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="text-sm font-semibold text-zinc-300">
        Keyword Images & GIFs
      </h3>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && query && onFetch(query)}
          placeholder="Search images by keyword…"
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none"
        />
        <button
          onClick={() => query && onFetch(query)}
          disabled={isLoading || !query}
          className="rounded-lg bg-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-600 disabled:opacity-50"
        >
          {isLoading ? "…" : "Search"}
        </button>
      </div>

      <div className="flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              tab === t.key
                ? "bg-indigo-500/20 text-indigo-300"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-800"
            >
              <img
                src={item.thumbnailUrl}
                alt={item.alt}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1 pt-4">
                <span className="text-[10px] font-medium text-zinc-300">
                  {item.source}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isLoading && (
          <p className="py-4 text-center text-xs text-zinc-500">
            Search for keywords to find images and GIFs
          </p>
        )
      )}
    </div>
  );
}
