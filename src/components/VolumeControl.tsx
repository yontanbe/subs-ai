"use client";

interface Props {
  volume: number;
  onChange: (volume: number) => void;
  label?: string;
}

export default function VolumeControl({
  volume,
  onChange,
  label = "Volume",
}: Props) {
  return (
    <div className="flex items-center gap-3">
      <svg
        className="h-3.5 w-3.5 shrink-0 text-white/25"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.8l4.72-3.15A.5.5 0 0112 6.1v11.8a.5.5 0 01-.78.42L6.5 15.2H4a1 1 0 01-1-1v-4.4a1 1 0 011-1h2.5z"
        />
      </svg>
      <div className="flex-1">
        <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-white/20">
          {label}
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <span className="w-9 text-right font-mono text-[11px] text-[#3dd6c8]/60">
        {volume}%
      </span>
    </div>
  );
}
