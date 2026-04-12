import CalendarView from "@/components/CalendarView";

export const metadata = {
  title: "Content Calendar — ReelMix",
};

export default function CalendarPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white/90">
          Calendar
        </h1>
        <p className="mt-1 text-[13px] text-white/30">
          Plan content across Instagram, TikTok, and YouTube
        </p>
      </div>
      <CalendarView />
    </div>
  );
}
