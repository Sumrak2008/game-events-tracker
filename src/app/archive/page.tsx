import type { Metadata } from "next";

import { RecordExplorer } from "@/components/RecordExplorer";
import { getTrackerData } from "@/lib/data";
import { computeStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Архив" };

export default async function ArchivePage() {
  const { records, games, now: serverNow } = await getTrackerData();

  const completed = records.filter(
    (r) => computeStatus(r, serverNow) === "completed",
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Архив завершенных записей</h1>
        <p className="text-muted">
          Записи, у которых дата окончания уже прошла. Архив формируется
          автоматически, данные не удаляются.
        </p>
      </header>

      <RecordExplorer
        records={completed}
        games={games}
        serverNow={serverNow}
        defaultSort="recently-ended"
        emptyMessage="Завершенных записей пока нет."
      />
    </div>
  );
}
