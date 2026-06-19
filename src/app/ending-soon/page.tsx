import type { Metadata } from "next";

import { DemoNotice } from "@/components/DemoNotice";
import { RecordExplorer } from "@/components/RecordExplorer";
import { getTrackerData } from "@/lib/data";
import { computeStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Скоро закончатся" };

export default async function EndingSoonPage() {
  const { records, games, now: serverNow } = await getTrackerData();

  const active = records.filter(
    (r) => computeStatus(r, serverNow) === "active",
  );
  const hasDemo = active.some((r) => r.isDemo);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Скоро закончатся</h1>
        <p className="text-muted">
          Активные записи, отсортированные по ближайшему окончанию.
        </p>
      </header>

      {hasDemo ? <DemoNotice /> : null}

      <RecordExplorer
        records={active}
        games={games}
        serverNow={serverNow}
        defaultSort="ending-soon"
        emptyMessage="Сейчас нет активных записей."
      />
    </div>
  );
}
