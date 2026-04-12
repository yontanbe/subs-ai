"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  onVideoImported: (file: File, title: string) => void;
}

type Phase = "idle" | "loading" | "preview" | "downloading" | "error";

const YT_ID = /^[a-zA-Z0-9_-]{11}$/;

function isValidYouTubeUrl(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\./i, "");

    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return !!id && YT_ID.test(id);
    }

    if (!host.endsWith("youtube.com")) return false;

    if (u.pathname === "/watch" || u.pathname.startsWith("/watch")) {
      const v = u.searchParams.get("v");
      return !!v && YT_ID.test(v);
    }

    if (u.pathname.startsWith("/shorts/")) {
      const id = u.pathname.split("/").filter(Boolean)[1];
      return !!id && YT_ID.test(id);
    }

    if (u.pathname.startsWith("/embed/")) {
      const id = u.pathname.split("/").filter(Boolean)[1];
      return !!id && YT_ID.test(id);
    }

    return false;
  } catch {
    return false;
  }
}

function sanitizeFileName(title: string): string {
  return (
    title
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
      .trim()
      .slice(0, 80) || "youtube-video"
  );
}

async function fetchVideoAsFile(
  downloadUrl: string,
  title: string,
  onProgress: (pct: number | null) => void
): Promise<File> {
  const res = await fetch(downloadUrl);
  if (!res.ok) {
    throw new Error("Download failed. Try again.");
  }

  const lenHeader = res.headers.get("content-length");
  const total = lenHeader ? parseInt(lenHeader, 10) : NaN;
  const hasTotal = Number.isFinite(total) && total > 0;

  const blob = await new Promise<Blob>((resolve, reject) => {
    if (!res.body) {
      res
        .blob()
        .then(resolve)
        .catch(reject);
      return;
    }

    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

    const pump = (): void => {
      reader
        .read()
        .then(({ done, value }) => {
          if (done) {
            const merged = new Uint8Array(received);
            let offset = 0;
            for (const c of chunks) {
              merged.set(c, offset);
              offset += c.length;
            }
            resolve(new Blob([merged]));
            return;
          }
          if (value) {
            chunks.push(value);
            received += value.length;
            if (hasTotal) {
              onProgress(Math.min(100, Math.round((received / total) * 100)));
            } else {
              onProgress(null);
            }
          }
          pump();
        })
        .catch(reject);
    };

    pump();
  });

  const base = sanitizeFileName(title);
  const type = blob.type || "video/mp4";
  const ext = type.includes("webm")
    ? "webm"
    : type.includes("mp4")
      ? "mp4"
      : "mp4";

  return new File([blob], `${base}.${ext}`, { type: type || "video/mp4" });
}

export default function YouTubeImporter({ onVideoImported }: Props) {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadPct, setDownloadPct] = useState<number | null>(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFetchedRef = useRef<string>("");
  const fetchGenRef = useRef(0);

  const resetPreview = useCallback(() => {
    setTitle("");
    setThumbnailUrl("");
    setDownloadUrl(null);
  }, []);

  useEffect(() => {
    setErrorMessage(null);
    const trimmed = url.trim();

    if (!trimmed) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      fetchGenRef.current += 1;
      setPhase("idle");
      resetPreview();
      lastFetchedRef.current = "";
      return;
    }

    if (!isValidYouTubeUrl(trimmed)) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      fetchGenRef.current += 1;
      setPhase("idle");
      resetPreview();
      lastFetchedRef.current = "";
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (trimmed === lastFetchedRef.current) return;
      lastFetchedRef.current = trimmed;
      const gen = ++fetchGenRef.current;
      setPhase("loading");
      resetPreview();

      try {
        const res = await fetch("/api/youtube", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmed }),
        });

        const data = (await res.json()) as {
          downloadUrl?: string;
          title?: string;
          thumbnailUrl?: string;
          error?: string;
        };

        if (gen !== fetchGenRef.current) return;

        if (!res.ok) {
          setPhase("error");
          setErrorMessage(
            data.error || "Could not load video info. Try another link."
          );
          return;
        }

        if (!data.downloadUrl || !data.title) {
          setPhase("error");
          setErrorMessage("Unexpected response from the server.");
          return;
        }

        setTitle(data.title);
        setThumbnailUrl(data.thumbnailUrl || "");
        setDownloadUrl(data.downloadUrl);
        setPhase("preview");
      } catch {
        if (gen !== fetchGenRef.current) return;
        setPhase("error");
        setErrorMessage("Network error. Check your connection and try again.");
      }
    }, 450);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [url, resetPreview]);

  const handleImport = async () => {
    if (!downloadUrl || !title) return;
    setPhase("downloading");
    setDownloadPct(0);
    setErrorMessage(null);

    try {
      const file = await fetchVideoAsFile(downloadUrl, title, (pct) => {
        setDownloadPct(pct);
      });
      onVideoImported(file, title);
      setPhase("idle");
      setUrl("");
      resetPreview();
      lastFetchedRef.current = "";
    } catch (e) {
      setPhase("error");
      setErrorMessage(
        e instanceof Error ? e.message : "Download failed. Try again."
      );
    }
  };

  const showPreview = phase === "preview" && !!downloadUrl && !!title;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-[#FF0000]/15">
          <svg
            className="h-5 w-5 text-[#FF0000]"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </div>
        <h3 className="text-[15px] font-semibold tracking-tight text-white/90">
          YouTube Import
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="yt-url"
            className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/35"
          >
            Video URL
          </label>
          <input
            id="yt-url"
            type="url"
            inputMode="url"
            placeholder="https://www.youtube.com/watch?v=…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPaste={(e) => {
              const t = e.clipboardData.getData("text");
              if (t) setUrl(t);
            }}
            className="input-glass w-full rounded-xl px-3.5 py-2.5 text-[13px] text-white/90 placeholder:text-white/25"
            autoComplete="off"
          />
        </div>

        {phase === "loading" && (
          <div className="flex items-center gap-2 text-[13px] text-white/50">
            <span className="spinner" />
            Validating and fetching video info…
          </div>
        )}

        {phase === "error" && errorMessage && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-200/90"
          >
            {errorMessage}
          </div>
        )}

        {showPreview && (
          <div className="animate-fade-up space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
            <div className="flex gap-3">
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-black">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-white/30">
                    No thumbnail
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[13px] font-medium text-white/90">
                  {title}
                </p>
                <p className="mt-1 text-[11px] text-white/35">
                  Ready to import
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setUrl("");
                  setPhase("idle");
                  resetPreview();
                  lastFetchedRef.current = "";
                }}
                className="btn-secondary order-2 rounded-xl px-4 py-2.5 text-[13px] font-medium text-white/80 sm:order-1"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleImport}
                className="btn-glow order-1 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white sm:order-2 sm:min-w-[140px]"
              >
                Import video
              </button>
            </div>
          </div>
        )}

        {phase === "downloading" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12px] text-white/50">
              <span>Downloading…</span>
              {downloadPct !== null ? (
                <span className="font-mono text-white/70">{downloadPct}%</span>
              ) : (
                <span className="font-mono text-white/45">…</span>
              )}
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#e09145] transition-[width] duration-200"
                style={{
                  width:
                    downloadPct !== null ? `${downloadPct}%` : "40%",
                }}
              />
            </div>
            {downloadPct === null && (
              <p className="text-[11px] text-white/35">
                Size unknown — showing activity…
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
