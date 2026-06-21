"use client";

import { useMemo } from "react";

import { EmptyState } from "@/components/EmptyState";
import { RecordCard } from "@/components/RecordCard";
import { SectionHeader } from "@/components/SectionHeader";
import { formatLocalDate } from "@/lib/format";
import {
  computeRecords,
  endsToday,
  endsWithinDays,
  sortRecords,
} from "@/lib/status";
import type { ComputedRecord, Game, TrackerRecord } from "@/lib/types";
import { useNow } from "@/lib/useNow";

function Section({
  title,
  icon,
  records,
  games,
  now,
  href,
  limit = 6,
  emptyText,
}: {
  title: string;
  icon: string;
  records: ComputedRecord[];
  games: Map<string, Game>;
  now: number;
  href?: string;
  limit?: number;
  emptyText: string;
}) {
  const shown = records.slice(0, limit);
  return (
    <section>
      <SectionHeader
        title={title}
        icon={icon}
        count={records.length}
        href={records.length > limit ? href : undefined}
      />
      {shown.length === 0 ? (
        <EmptyState message={emptyText} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              game={games.get(record.gameId)}
              now={now}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function HomeDashboard({
  records,
  games,
  serverNow,
  lastVerifiedMs,
}: {
  records: TrackerRecord[];
  games: Game[];
  serverNow: number;
  lastVerifiedMs: number | null;
}) {
  const now = useNow(serverNow);
  const gamesMap = useMemo(() => new Map(games.map((g) => [g.id, g])), [games]);

  const groups = useMemo(() => {
    const computed = computeRecords(records, now).filter(
      (r) => r.confidence !== "conflicting" && r.confidence !== "unverified",
    );
    const byEnd = (list: ComputedRecord[]) => sortRecords(list, "ending-soon");
    const active = computed.filter((r) => r.status === "active");

    return {
      today: byEnd(computed.filter((r) => endsToday(r, now))),
      soon: byEnd(
        computed.filter((r) => endsWithinDays(r, now, 3) && !endsToday(r, now)),
      ),
      banners: byEnd(active.filter((r) => r.type === "banner")),
      events: byEnd(active.filter((r) => r.type === "event")),
      seasons: byEnd(active.filter((r) => r.type === "season")),
      upcoming: sortRecords(
        computed.filter((r) => r.status === "upcoming"),
        "starting-soon",
      ),
    };
  }, [records, now]);

  return (
    <div className="space-y-10">
      <div className="text-muted flex flex-wrap items-center justify-between gap-2 text-sm">
        <p>
          Сводка по {records.length} записям из {games.length} игр.
        </p>
        <p>
          Последняя проверка данных:{" "}
          <span className="text-text">
            {lastVerifiedMs
              ? formatLocalDate(new Date(lastVerifiedMs).toISOString())
              : "нет данных"}
          </span>
        </p>
      </div>

      <Section
        title="Заканчиваются сегодня"
        icon="!"
        records={groups.today}
        games={gamesMap}
        now={now}
        href="/ending-soon"
        emptyText="Сегодня ничего не заканчивается."
      />
      <Section
        title="Заканчиваются в ближайшие 3 дня"
        icon="3"
        records={groups.soon}
        games={gamesMap}
        now={now}
        href="/ending-soon"
        emptyText="В ближайшие три дня окончаний нет."
      />
      <Section
        title="Активные баннеры"
        icon="Б"
        records={groups.banners}
        games={gamesMap}
        now={now}
        emptyText="Нет активных баннеров."
      />
      <Section
        title="Активные события"
        icon="С"
        records={groups.events}
        games={gamesMap}
        now={now}
        emptyText="Нет активных событий."
      />
      <Section
        title="Текущие сезоны"
        icon="З"
        records={groups.seasons}
        games={gamesMap}
        now={now}
        emptyText="Нет текущих сезонов."
      />
      <Section
        title="Ближайшие предстоящие"
        icon="+"
        records={groups.upcoming}
        games={gamesMap}
        now={now}
        href="/calendar"
        emptyText="Нет предстоящих записей."
      />
    </div>
  );
}
