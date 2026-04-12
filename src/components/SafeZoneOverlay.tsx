"use client";

import type { CSSProperties } from "react";
import type { SafeZonePlatform } from "@/types";

const PLATFORM_COLORS: Record<SafeZonePlatform, string> = {
  instagram: "#E1306C",
  tiktok: "#00f2ea",
  youtube: "#FF0000",
};

interface ZoneBoxProps {
  color: string;
  label: string;
  style: CSSProperties;
}

function ZoneBox({ color, label, style }: ZoneBoxProps) {
  return (
    <div
      className="pointer-events-none absolute box-border"
      style={{
        ...style,
        backgroundColor: `${color}14`,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: `${color}33`,
      }}
    >
      <span
        className="absolute left-1 top-1 max-w-[90%] truncate rounded bg-black/30 px-1 py-0.5 text-[9px] font-medium leading-tight text-white/90"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
      >
        {label}
      </span>
    </div>
  );
}

interface Props {
  platform: SafeZonePlatform;
  visible: boolean;
}

export default function SafeZoneOverlay({ platform, visible }: Props) {
  if (!visible) return null;

  const color = PLATFORM_COLORS[platform];

  if (platform === "instagram") {
    return (
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        <ZoneBox
          color={color}
          label="Camera & status"
          style={{ left: 0, right: 0, top: 0, height: "15%" }}
        />
        <ZoneBox
          color={color}
          label="Like, comment, share"
          style={{ left: 0, right: 0, bottom: 0, height: "25%" }}
        />
        <ZoneBox
          color={color}
          label="Actions"
          style={{ top: 0, right: 0, bottom: 0, width: "12%" }}
        />
      </div>
    );
  }

  if (platform === "tiktok") {
    return (
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        <ZoneBox
          color={color}
          label="Following / For You"
          style={{ left: 0, right: 0, top: 0, height: "12%" }}
        />
        <ZoneBox
          color={color}
          label="Caption & music"
          style={{ left: 0, right: 0, bottom: 0, height: "20%" }}
        />
        <ZoneBox
          color={color}
          label="Profile & actions"
          style={{ top: 0, right: 0, bottom: 0, width: "15%" }}
        />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <ZoneBox
        color={color}
        label="Search & camera"
        style={{ left: 0, right: 0, top: 0, height: "10%" }}
      />
      <ZoneBox
        color={color}
        label="Subscribe & engagement"
        style={{ left: 0, right: 0, bottom: 0, height: "18%" }}
      />
      <ZoneBox
        color={color}
        label="Actions"
        style={{ top: 0, right: 0, bottom: 0, width: "10%" }}
      />
    </div>
  );
}
