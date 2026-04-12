"use client";

import type { AIModelConfig, TranscriptionEngine, LLMProvider } from "@/types";

interface Props {
  config: AIModelConfig;
  onChange: (config: AIModelConfig) => void;
}

const SECTIONS: {
  key: keyof AIModelConfig;
  label: string;
  desc: string;
  accent: string;
  icon: React.ReactNode;
  options: { value: string; label: string; badge?: string }[];
}[] = [
  {
    key: "transcription",
    label: "Transcription",
    desc: "Speech-to-text engine",
    accent: "#e09145",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M7 4a3 3 0 016 0v6a3 3 0 01-6 0V4z" />
        <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
      </svg>
    ),
    options: [
      { value: "groq", label: "Groq Whisper", badge: "Free" },
      { value: "openai", label: "OpenAI Whisper", badge: "Paid" },
    ],
  },
  {
    key: "translation",
    label: "Translation",
    desc: "Subtitle translation model",
    accent: "#3dd6c8",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M7.75 2.75a.75.75 0 00-1.5 0v1.258a32.987 32.987 0 00-3.599.278.75.75 0 10.198 1.487A31.545 31.545 0 018.7 5.545 19.381 19.381 0 017 9.56a19.418 19.418 0 01-1.002-2.05.75.75 0 00-1.384.577 20.935 20.935 0 001.492 2.91 19.613 19.613 0 01-3.828 4.154.75.75 0 10.945 1.164A21.116 21.116 0 007 12.331c.095.132.192.262.29.391a.75.75 0 001.194-.91c-.204-.266-.4-.538-.59-.815a20.88 20.88 0 002.333-5.332c.31.031.618.068.924.108a.75.75 0 00.198-1.487 32.832 32.832 0 00-2.099-.21V2.75z" />
        <path fillRule="evenodd" d="M13 8a.75.75 0 01.671.415l4.25 8.5a.75.75 0 11-1.342.67L15.787 16h-5.573l-.793 1.585a.75.75 0 11-1.342-.67l4.25-8.5A.75.75 0 0113 8zm2.037 6.5L13 10.427 10.964 14.5h4.073z" clipRule="evenodd" />
      </svg>
    ),
    options: [
      { value: "gemini", label: "Gemini Flash", badge: "Fast" },
      { value: "openai", label: "GPT-4o Mini", badge: "Quality" },
    ],
  },
  {
    key: "keywordExtraction",
    label: "B-Roll Keywords",
    desc: "Content analysis for auto B-roll",
    accent: "#a855f7",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909-4.97-4.969a.75.75 0 00-1.06 0L2.5 11.06z" clipRule="evenodd" />
      </svg>
    ),
    options: [
      { value: "gemini", label: "Gemini Flash", badge: "Fast" },
      { value: "openai", label: "GPT-4o Mini", badge: "Quality" },
    ],
  },
];

export default function AIModelSettings({ config, onChange }: Props) {
  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5 space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-violet-400">
            <path fillRule="evenodd" d="M14.5 10a4.5 4.5 0 004.284-5.882c-.105-.324-.51-.391-.752-.15L15.34 6.66a.454.454 0 01-.493.101 3.046 3.046 0 01-1.608-1.607.454.454 0 01.1-.493l2.693-2.692c.24-.241.174-.647-.15-.752a4.5 4.5 0 00-5.873 4.575c.055.873-.128 1.808-.8 2.368l-7.23 6.024a2.724 2.724 0 103.837 3.837l6.024-7.23c.56-.672 1.495-.855 2.368-.8.096.007.193.01.291.01zM5 16a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
            <path d="M14.5 11.5c.173 0 .345-.007.514-.022l3.754 3.754a2.002 2.002 0 01-2.828 2.828l-3.062-3.062-.5.5a8.088 8.088 0 00.002-.002l2.12-4z" />
          </svg>
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-white/90">AI Models</h3>
          <p className="text-[11px] text-white/35">Choose per component</p>
        </div>
      </div>

      {SECTIONS.map((section) => {
        const currentValue = config[section.key];
        return (
          <div key={section.key}>
            <div className="mb-2 flex items-center gap-2">
              <span style={{ color: section.accent }}>{section.icon}</span>
              <div>
                <span className="text-[12px] font-semibold text-white/75">
                  {section.label}
                </span>
                <span className="ml-2 text-[10px] text-white/30">
                  {section.desc}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {section.options.map((opt) => {
                const selected = currentValue === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...config,
                        [section.key]: opt.value as TranscriptionEngine & LLMProvider,
                      })
                    }
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-[12px] font-medium transition-all ${
                      selected
                        ? "border-white/20 bg-white/[0.06] text-white/90 shadow-sm"
                        : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/12 hover:text-white/60"
                    }`}
                  >
                    {opt.label}
                    {opt.badge && (
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          selected
                            ? "bg-white/10 text-white/60"
                            : "bg-white/[0.04] text-white/25"
                        }`}
                      >
                        {opt.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
