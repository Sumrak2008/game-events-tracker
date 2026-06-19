import type { Metadata } from "next";

import { CalendarView } from "@/components/CalendarView";
import { DemoNotice } from "@/components/DemoNotice";
import { getTrackerData } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Календарь" };

export default async function CalendarPage() {
  const { records, games, now: serverNow } = await getTrackerData();
  const hasDemo = records.some((r) => r.isDemo);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Календарь</h1>
        <p className="text-muted">
          Дни начала и окончания записей. Выберите день, чтобы увидеть детали.
        </p>
      </header>

      {hasDemo ? <DemoNotice /> : null}

      <CalendarView records={records} games={games} serverNow={serverNow} />
    </div>
  );
}
