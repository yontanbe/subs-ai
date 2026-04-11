import CalendarView from "@/components/CalendarView";

export const metadata = {
  title: "Content Calendar - SubsAI",
};

export default function CalendarPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-white">Content Calendar</h1>
      <CalendarView />
    </div>
  );
}
