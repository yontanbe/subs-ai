"use client";

import type { LayoutConfig, PipCorner, VideoLayout } from "@/types";

interface Props {
  config: LayoutConfig;
  onChange: (config: LayoutConfig) => void;
  hasSecondaryVideo: boolean;
}

const LAYOUTS: { id: VideoLayout; label: string }[] = [
  { id: "main-only", label: "Main Only" },
  { id: "pip", label: "Picture-in-Picture" },
  { id: "side-by-side", label: "Side by Side" },
  { id: "top-bottom", label: "Top & Bottom" },
  { id: "blur-bg", label: "Blur Background" },
  { id: "split-border", label: "Split with Border" },
];

const CORNERS: PipCorner[] = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];

function MainOnlyPreview() {
  return (
    <svg
      width={60}
      height={40}
      viewBox="0 0 60 40"
      className="shrink-0 text-white/35"
      aria-hidden
    >
      <rect
        x={1}
        y={1}
        width={58}
        height={38}
        rx={3}
        fill="currentColor"
        className="text-[#3dd6c8]/35"
        stroke="currentColor"
        strokeWidth={1}
      />
    </svg>
  );
}

function PipPreview({ corner }: { corner: PipCorner }) {
  const coords: Record<PipCorner, { x: number; y: number }> = {
    "top-left": { x: 2, y: 2 },
    "top-right": { x: 40, y: 2 },
    "bottom-left": { x: 2, y: 26 },
    "bottom-right": { x: 40, y: 26 },
  };
  const { x, y } = coords[corner];

  return (
    <svg
      width={60}
      height={40}
      viewBox="0 0 60 40"
      className="shrink-0 text-white/35"
      aria-hidden
    >
      <rect
        x={1}
        y={1}
        width={58}
        height={38}
        rx={3}
        fill="currentColor"
        className="text-white/12"
        stroke="currentColor"
        strokeWidth={1}
      />
      <rect
        x={x}
        y={y}
        width={18}
        height={12}
        rx={2}
        fill="currentColor"
        className="text-[#3dd6c8]/50"
      />
    </svg>
  );
}

function SideBySidePreview() {
  return (
    <svg
      width={60}
      height={40}
      viewBox="0 0 60 40"
      className="shrink-0 text-white/35"
      aria-hidden
    >
      <rect
        x={1}
        y={1}
        width={27}
        height={38}
        rx={3}
        fill="currentColor"
        className="text-white/12"
        stroke="currentColor"
        strokeWidth={1}
      />
      <rect
        x={32}
        y={1}
        width={27}
        height={38}
        rx={3}
        fill="currentColor"
        className="text-white/12"
        stroke="currentColor"
        strokeWidth={1}
      />
    </svg>
  );
}

function TopBottomPreview() {
  return (
    <svg
      width={60}
      height={40}
      viewBox="0 0 60 40"
      className="shrink-0 text-white/35"
      aria-hidden
    >
      <rect
        x={1}
        y={1}
        width={58}
        height={16}
        rx={3}
        fill="currentColor"
        className="text-white/12"
        stroke="currentColor"
        strokeWidth={1}
      />
      <rect
        x={1}
        y={22}
        width={58}
        height={17}
        rx={3}
        fill="currentColor"
        className="text-white/12"
        stroke="currentColor"
        strokeWidth={1}
      />
    </svg>
  );
}

function BlurBgPreview() {
  return (
    <svg
      width={60}
      height={40}
      viewBox="0 0 60 40"
      className="shrink-0 text-white/35"
      aria-hidden
    >
      <rect
        x={1}
        y={1}
        width={58}
        height={38}
        rx={3}
        fill="currentColor"
        className="text-white/8"
        stroke="currentColor"
        strokeWidth={1}
      />
      <rect
        x={14}
        y={6}
        width={32}
        height={28}
        rx={2}
        fill="currentColor"
        className="text-[#3dd6c8]/45"
        stroke="currentColor"
        strokeWidth={1}
      />
    </svg>
  );
}

function SplitBorderPreview() {
  return (
    <svg
      width={60}
      height={40}
      viewBox="0 0 60 40"
      className="shrink-0 text-white/35"
      aria-hidden
    >
      <rect
        x={1}
        y={1}
        width={26}
        height={38}
        rx={3}
        fill="currentColor"
        className="text-white/12"
        stroke="currentColor"
        strokeWidth={1}
      />
      <rect x={29} y={1} width={4} height={38} fill="white" opacity={0.85} />
      <rect
        x={34}
        y={1}
        width={25}
        height={38}
        rx={3}
        fill="currentColor"
        className="text-white/12"
        stroke="currentColor"
        strokeWidth={1}
      />
    </svg>
  );
}

function LayoutVisual({ layout, pipCorner }: LayoutConfig) {
  switch (layout) {
    case "main-only":
      return <MainOnlyPreview />;
    case "pip":
      return <PipPreview corner={pipCorner ?? "bottom-right"} />;
    case "side-by-side":
      return <SideBySidePreview />;
    case "top-bottom":
      return <TopBottomPreview />;
    case "blur-bg":
      return <BlurBgPreview />;
    case "split-border":
      return <SplitBorderPreview />;
    default:
      return <MainOnlyPreview />;
  }
}

function layoutNeedsRatio(layout: VideoLayout): boolean {
  return (
    layout === "side-by-side" ||
    layout === "top-bottom" ||
    layout === "split-border"
  );
}

export default function LayoutPicker({
  config,
  onChange,
  hasSecondaryVideo,
}: Props) {
  const ratio = config.ratio ?? 0.5;

  const setLayout = (layout: VideoLayout) => {
    const next: LayoutConfig = { layout };
    if (layout === "pip") {
      next.pipCorner = config.pipCorner ?? "bottom-right";
      next.ratio = config.ratio ?? 0.3;
    } else if (layoutNeedsRatio(layout)) {
      next.ratio = config.ratio ?? 0.5;
    }
    onChange(next);
  };

  const setCorner = (pipCorner: PipCorner) => {
    onChange({ ...config, layout: "pip", pipCorner });
  };

  const setRatio = (value: number) => {
    onChange({ ...config, ratio: value });
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]">
          <svg
            className="h-5 w-5 text-[#3dd6c8]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25zM13.5 6.75a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75a2.25 2.25 0 012.25-2.25h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018 20.25H6a2.25 2.25 0 01-2.25-2.25v-2.25z"
            />
          </svg>
        </div>
        <h3 className="text-[15px] font-semibold tracking-tight text-white/90">
          Video Layout
        </h3>
      </div>

      {!hasSecondaryVideo && (
        <p className="mb-4 text-[12px] text-white/40">
          Add a second video to enable multi-video layouts. Main only uses your
          primary video.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {LAYOUTS.map(({ id, label }) => {
          const selected = config.layout === id;
          const needsSecondary = id !== "main-only";
          const disabled = !hasSecondaryVideo && needsSecondary;
          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => setLayout(id)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all ${
                selected
                  ? "border-[#3dd6c8] bg-[#3dd6c8]/5 shadow-[0_0_0_1px_rgba(61,214,200,0.2)]"
                  : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"
              } ${
                disabled
                  ? "cursor-not-allowed opacity-40"
                  : "cursor-pointer"
              }`}
            >
              <LayoutVisual layout={id} pipCorner={config.pipCorner} />
              <span className="text-[11px] font-medium text-white/70">
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {hasSecondaryVideo && config.layout === "pip" && (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-white/35">
            PiP corner
          </p>
          <div className="grid grid-cols-2 gap-2">
            {CORNERS.map((c) => {
              const active = (config.pipCorner ?? "bottom-right") === c;
              const label =
                c === "top-left"
                  ? "TL"
                  : c === "top-right"
                    ? "TR"
                    : c === "bottom-left"
                      ? "BL"
                      : "BR";
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCorner(c)}
                  className={`rounded-lg border px-3 py-2 text-[12px] font-medium transition-all ${
                    active
                      ? "border-[#3dd6c8] bg-[#3dd6c8]/10 text-[#3dd6c8]"
                      : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hasSecondaryVideo && layoutNeedsRatio(config.layout) && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/35">
              First video size
            </span>
            <span className="font-mono text-[11px] text-white/45">
              {Math.round(ratio * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0.3}
            max={0.7}
            step={0.01}
            value={ratio}
            onChange={(e) => setRatio(Number(e.target.value))}
            className="w-full"
          />
          <div className="mt-1 flex justify-between text-[10px] text-white/25">
            <span>30%</span>
            <span>70%</span>
          </div>
        </div>
      )}
    </div>
  );
}
