"use client";

import { useCallback, useEffect, useState } from "react";
import type { CalendarEntry } from "@/types";
import CalendarEntryCard from "./CalendarEntry";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PLATFORMS = [
  { value: "youtube", label: "YouTube", icon: "▶", active: "border-red-500/40 bg-red-500/10 text-red-400" },
  { value: "instagram", label: "Instagram", icon: "◻", active: "border-pink-500/40 bg-pink-500/10 text-pink-400" },
  { value: "tiktok", label: "TikTok", icon: "♫", active: "border-white/20 bg-white/[0.08] text-white/70" },
] as const;

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPlatform, setFormPlatform] = useState<string>("youtube");

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/calendar?month=${month + 1}&year=${year}`
      );
      const data = await res.json();
      setEntries(data.entries ?? []);
    } catch {
      /* DB may not be configured yet */
    }
  }, [month, year]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const getEntriesForDay = (day: number) => {
    return entries.filter((e) => {
      const d = new Date(e.scheduled_date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const handleAdd = async () => {
    if (!formTitle || !formDate) return;
    try {
      await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDesc,
          platform: formPlatform,
          scheduled_date: new Date(formDate).toISOString(),
        }),
      });
      setFormTitle("");
      setFormDesc("");
      setShowForm(false);
      fetchEntries();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch("/api/calendar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchEntries();
    } catch { /* ignore */ }
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthLabel = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/40 transition hover:bg-white/[0.06] hover:text-white/70"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold tracking-tight text-white/90">
          {monthLabel}
        </h2>
        <button
          onClick={nextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/40 transition hover:bg-white/[0.06] hover:text-white/70"
        >
          →
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7">
        {DAYS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[10px] font-semibold uppercase tracking-widest text-white/20"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.04]">
        {cells.map((day, i) => {
          const dayEntries = day ? getEntriesForDay(day) : [];
          const isToday =
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

          return (
            <div
              key={i}
              className={`min-h-[80px] sm:min-h-[100px] bg-[#0a0a0f] p-1.5 transition-colors ${
                day
                  ? "cursor-pointer hover:bg-white/[0.03]"
                  : "bg-[#08080c]"
              }`}
              onClick={() => {
                if (!day) return;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                setFormDate(dateStr);
                setShowForm(true);
              }}
            >
              {day && (
                <>
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-medium ${
                      isToday
                        ? "bg-[#e09145] text-white font-semibold"
                        : "text-white/35"
                    }`}
                  >
                    {day}
                  </span>
                  <div className="mt-0.5 space-y-0.5">
                    {dayEntries.slice(0, 2).map((e) => (
                      <CalendarEntryCard
                        key={e.id}
                        entry={e}
                        onDelete={handleDelete}
                      />
                    ))}
                    {dayEntries.length > 2 && (
                      <span className="block text-[9px] text-white/20">
                        +{dayEntries.length - 2} more
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Add button */}
      <button
        onClick={() => {
          setFormDate(
            `${year}-${String(month + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`
          );
          setShowForm(true);
        }}
        className="btn-secondary w-full rounded-2xl border-dashed py-3.5 text-[13px] font-medium text-white/30 transition hover:text-white/60"
      >
        + Add Content
      </button>

      {/* Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <div className="animate-fade-up w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-white/[0.08] bg-[#0e0e12] p-6 space-y-5 shadow-2xl">
            {/* Modal handle (mobile) */}
            <div className="mx-auto h-1 w-10 rounded-full bg-white/10 sm:hidden" />

            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-white/90">
                Add Content
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] text-white/30 transition hover:bg-white/[0.08] hover:text-white/60"
              >
                ×
              </button>
            </div>

            <input
              type="text"
              placeholder="Title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              autoFocus
              className="input-glass w-full rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder:text-white/20"
            />

            <textarea
              placeholder="Description (optional)"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              rows={2}
              className="input-glass w-full resize-none rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder:text-white/20"
            />

            <div className="flex gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setFormPlatform(p.value)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-3 text-[12px] font-semibold transition ${
                    formPlatform === p.value
                      ? p.active
                      : "border-white/[0.06] text-white/25 hover:border-white/[0.12]"
                  }`}
                >
                  <span className="text-[10px]">{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>

            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="input-glass w-full rounded-xl px-4 py-3 text-[14px] text-white/80"
            />

            <button
              onClick={handleAdd}
              disabled={!formTitle || !formDate}
              className="btn-glow w-full rounded-xl py-3 text-[14px] font-semibold text-white disabled:opacity-40"
            >
              Add to Calendar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
