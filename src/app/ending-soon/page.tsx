import type { Metadata } from "next";

import { DemoNotice } from "@/components/DemoNotice";
import { RecordExplorer } from "@/components/RecordExplorer";
import { getTrackerData } from "@/lib/data";
import { ENDING_SOON_DAYS } from "@/lib/gameStats";
import { endsWithinDays } from "@/lib/status";
import { getVisibleRecords } from "@/lib/visibility";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Скоро закончатся" };

export default async function EndingSoonPage() {
  const { records, games, now: serverNow } = await getTrackerData();

  // Only active records whose end is approaching make it onto this page —
  // upcoming records and records without a confirmed end are excluded by
  // construction (getVisibleRecords already drops anything without a
  // resolvable end date, and the endsWithinDays check keeps just the active
  // ones ending soon).
  const endingSoon = getVisibleRecords(records, serverNow).filter(
    (r) =>
      r.status === "active" && endsWithinDays(r, serverNow, ENDING_SOON_DAYS),
  );
  const hasDemo = endingSoon.some((r) => r.isDemo);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Скоро закончатся</h1>
        <p className="text-muted">
          Активные записи, окончание которых приближается (в пределах{" "}
          {ENDING_SOON_DAYS} дней), отсортированные по ближайшему окончанию.
        </p>
      </header>

      {hasDemo ? <DemoNotice /> : null}

      <RecordExplorer
        records={endingSoon}
        games={games}
        serverNow={serverNow}
        defaultSort="ending-soon"
        emptyMessage="Сейчас нет записей, которые скоро заканчиваются."
      />
    </div>
  );
}
