import type { Metadata } from "next";

import { DemoNotice } from "@/components/DemoNotice";
import { EmptyState } from "@/components/EmptyState";
import { RecordCard } from "@/components/RecordCard";
import { getTrackerData } from "@/lib/data";
import { sortPublicRecordsByUrgency } from "@/lib/sort";
import { DAY_MS, endOfLocalDay, endsToday } from "@/lib/status";
import type { ComputedRecord } from "@/lib/types";
import { getVisibleRecords } from "@/lib/visibility";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Скоро закончатся" };

export default async function EndingSoonPage() {
  const { records, games, now: serverNow } = await getTrackerData();
  const gamesMap = new Map(games.map((g) => [g.id, g]));
  const gameNameById = new Map(games.map((g) => [g.id, g.name]));

  // Only active records belong on this page — upcoming records (not started
  // yet) and completed/weapon-banner records (excluded by getVisibleRecords)
  // never appear here.
  const active = getVisibleRecords(records, serverNow).filter(
    (r) => r.status === "active",
  );
  const hasDemo = active.some((r) => r.isDemo);

  // getVisibleRecords guarantees every record here has a resolvable end date
  // (an unresolvable one would already have been filtered out as not
  // publicly visible), so there is no separate "no end date" bucket to fill.
  const todayEnd = endOfLocalDay(serverNow);
  const tomorrowEnd = todayEnd + DAY_MS;
  const day3End = todayEnd + 3 * DAY_MS;

  const today = active.filter((r) => endsToday(r, serverNow));
  const tomorrow = active.filter(
    (r) => !endsToday(r, serverNow) && r.endMs <= tomorrowEnd,
  );
  const next3Days = active.filter(
    (r) => r.endMs > tomorrowEnd && r.endMs <= day3End,
  );
  const later = active.filter((r) => r.endMs > day3End);

  const groups: { title: string; records: ComputedRecord[] }[] = [
    { title: "Сегодня", records: today },
    { title: "Завтра", records: tomorrow },
    { title: "В ближайшие 3 дня", records: next3Days },
    { title: "Позже", records: later },
  ]
    .map((g) => ({
      title: g.title,
      records: sortPublicRecordsByUrgency(g.records, gameNameById),
    }))
    .filter((g) => g.records.length > 0);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Скоро закончатся</h1>
        <p className="text-muted">
          Активные записи, сгруппированные по тому, когда они заканчиваются —
          сначала те, что заканчиваются раньше.
        </p>
      </header>

      {hasDemo ? <DemoNotice /> : null}

      {active.length === 0 ? (
        <EmptyState message="Сейчас нет активных записей." />
      ) : (
        groups.map((group) => (
          <section key={group.title} className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-text text-lg font-semibold">{group.title}</h2>
              <span className="bg-surface-2 text-muted rounded-full px-2 py-0.5 text-xs">
                {group.records.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.records.map((record) => (
                <RecordCard
                  key={record.id}
                  record={record}
                  game={gamesMap.get(record.gameId)}
                  now={serverNow}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
