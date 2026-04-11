"use client";

import { useCallback, useEffect, useState } from "react";
import type { CalendarEntry } from "@/types";
import CalendarEntryCard from "./CalendarEntry";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PLATFORMS = [
  { value: "youtube", label: "YouTube", color: "#EF4444" },
  { value: "instagram", label: "Instagram", color: "#EC4899" },
  { value: "tiktok", label: "TikTok", color: "#A1A1AA" },
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold text-white">{monthLabel}</h2>
        <button
          onClick={nextMonth}
          className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          →
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px">
        {DAYS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[10px] font-semibold uppercase text-zinc-500"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px rounded-xl border border-zinc-800 bg-zinc-800 overflow-hidden">
        {cells.map((day, i) => {
          const dayEntries = day ? getEntriesForDay(day) : [];
          const isToday =
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

          return (
            <div
              key={i}
              className={`min-h-[80px] sm:min-h-[100px] bg-zinc-900 p-1 ${
                day ? "cursor-pointer hover:bg-zinc-800/80" : ""
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
                    className={`inline-block rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
                      isToday
                        ? "bg-indigo-500 text-white"
                        : "text-zinc-400"
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
                      <span className="block text-[9px] text-zinc-500">
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
        className="w-full rounded-xl border border-dashed border-zinc-700 py-3 text-sm text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
      >
        + Add Content
      </button>

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">
                Add Content
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              placeholder="Title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none"
            />

            <textarea
              placeholder="Description (optional)"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none resize-none"
            />

            <div className="flex gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setFormPlatform(p.value)}
                  className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition ${
                    formPlatform === p.value
                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
            />

            <button
              onClick={handleAdd}
              disabled={!formTitle || !formDate}
              className="w-full rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
            >
              Add to Calendar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
