import CalendarView from "@/components/CalendarView";

export const metadata = {
  title: "Content Calendar — ReelMix",
};

export default function CalendarPage() {
  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Subtle background texture */}
      <div className="pointer-events-none fixed inset-0 dot-grid-subtle opacity-20" />

      <div className="relative mb-10">
        <h1 className="text-[26px] font-bold tracking-tight text-white/90">
          Calendar
        </h1>
        <p className="mt-1.5 text-[13px] text-white/30">
          Plan content across Instagram, TikTok, and YouTube
        </p>
      </div>
      <div className="relative">
        <CalendarView />
      </div>
    </div>
  );
}
