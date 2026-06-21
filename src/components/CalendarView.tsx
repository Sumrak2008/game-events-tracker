"use client";

import { useMemo, useState } from "react";

import { RecordCard } from "@/components/RecordCard";
import type { ComputedRecord, Game, TrackerRecord } from "@/lib/types";
import { useNow } from "@/lib/useNow";
import { getVisibleRecords } from "@/lib/visibility";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

function dayKey(year: number, month: number, day: number): string {
  return `${year}-${month}-${day}`;
}

function keyFromMs(ms: number): string {
  const d = new Date(ms);
  return dayKey(d.getFullYear(), d.getMonth(), d.getDate());
}

function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function CalendarView({
  records,
  games,
  serverNow,
}: {
  records: TrackerRecord[];
  games: Game[];
  serverNow: number;
}) {
  const now = useNow(serverNow);
  const gamesMap = useMemo(() => new Map(games.map((g) => [g.id, g])), [games]);
  // Completed records never appear on the calendar — getVisibleRecords keeps
  // only active/upcoming records before any start/end markers are built.
  const computed = useMemo(
    () => getVisibleRecords(records, now),
    [records, now],
  );

  const today = new Date(now);
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [selected, setSelected] = useState<string>(
    dayKey(today.getFullYear(), today.getMonth(), today.getDate()),
  );

  const { starts, ends } = useMemo(() => {
    const s = new Map<string, ComputedRecord[]>();
    const e = new Map<string, ComputedRecord[]>();
    for (const r of computed) {
      const sk = keyFromMs(r.startMs);
      const ek = keyFromMs(r.endMs);
      (s.get(sk) ?? s.set(sk, []).get(sk)!).push(r);
      (e.get(ek) ?? e.set(ek, []).get(ek)!).push(r);
    }
    return { starts: s, ends: e };
  }, [computed]);

  const firstOfMonth = new Date(view.year, view.month, 1);
  const leading = mondayIndex(firstOfMonth);
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const todayKey = dayKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const cells: (number | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function shiftMonth(delta: number) {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  // The site has no archive — browsing into a fully past month would only
  // ever show empty markers (completed records are filtered out above), so
  // the "previous month" control is disabled once the current month is
  // reached.
  const isCurrentMonth =
    view.year === today.getFullYear() && view.month === today.getMonth();
  const canGoToPreviousMonth = !isCurrentMonth;

  const selStarts = starts.get(selected) ?? [];
  const selEnds = ends.get(selected) ?? [];
  const [sy, sm, sd] = selected.split("-").map(Number);
  const dayStartMs = new Date(sy, sm, sd, 0, 0, 0, 0).getTime();
  const dayEndMs = new Date(sy, sm, sd, 23, 59, 59, 999).getTime();
  const spanning = computed.filter(
    (r) =>
      r.startMs <= dayEndMs &&
      r.endMs >= dayStartMs &&
      keyFromMs(r.startMs) !== selected &&
      keyFromMs(r.endMs) !== selected,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="card p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {MONTHS[view.month]} {view.year}
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              disabled={!canGoToPreviousMonth}
              className="border-border text-muted hover:text-text disabled:hover:text-muted flex h-10 w-10 items-center justify-center rounded-lg border text-sm transition disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Предыдущий месяц"
              title={
                canGoToPreviousMonth
                  ? "Предыдущий месяц"
                  : "Сайт не показывает полностью прошедшие месяцы"
              }
            >
              ←
            </button>
            <button
              type="button"
              onClick={() =>
                setView({ year: today.getFullYear(), month: today.getMonth() })
              }
              className="border-border text-muted hover:text-text h-10 rounded-lg border px-3 text-sm transition"
            >
              Сегодня
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="border-border text-muted hover:text-text flex h-10 w-10 items-center justify-center rounded-lg border text-sm transition"
              aria-label="Следующий месяц"
            >
              →
            </button>
          </div>
        </div>

        <div className="text-muted grid grid-cols-7 gap-1 text-center text-xs">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null)
              return <div key={`b-${i}`} className="aspect-square" />;
            const key = dayKey(view.year, view.month, day);
            const nStart = starts.get(key)?.length ?? 0;
            const nEnd = ends.get(key)?.length ?? 0;
            const isToday = key === todayKey;
            const isSelected = key === selected;
            const summary = [
              nStart > 0 ? `начинается ${nStart}` : null,
              nEnd > 0 ? `заканчивается ${nEnd}` : null,
            ]
              .filter(Boolean)
              .join(", ");
            return (
              <button
                type="button"
                key={key}
                onClick={() => setSelected(key)}
                aria-current={isToday ? "date" : undefined}
                aria-label={`${day} ${MONTHS[view.month]}${summary ? `, ${summary}` : ""}`}
                className={`flex aspect-square flex-col items-center justify-start rounded-lg border p-1 text-xs transition ${
                  isSelected
                    ? "border-accent bg-surface-2"
                    : isToday
                      ? "border-accent/50 bg-surface/60"
                      : "border-border hover:bg-surface-2/60"
                }`}
              >
                <span
                  className={`leading-5 ${
                    isToday ? "text-accent font-bold" : "text-text"
                  }`}
                >
                  {day}
                </span>
                <span className="mt-auto flex flex-wrap items-center justify-center gap-0.5">
                  {nStart > 0 ? (
                    <span
                      className="bg-upcoming/20 text-upcoming rounded px-1 text-[10px]"
                      title={`Начинается: ${nStart}`}
                    >
                      ↑{nStart}
                    </span>
                  ) : null}
                  {nEnd > 0 ? (
                    <span
                      className="bg-event/20 text-event rounded px-1 text-[10px]"
                      title={`Заканчивается: ${nEnd}`}
                    >
                      ↓{nEnd}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="text-muted mt-3 flex flex-wrap items-center gap-4 text-xs"
          aria-hidden="true"
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="bg-upcoming h-1.5 w-1.5 rounded-full" />
            начинается
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="bg-event h-1.5 w-1.5 rounded-full" />
            заканчивается
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="border-accent/60 bg-surface h-2.5 w-2.5 rounded border" />
            сегодня
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-semibold">
          {sd} {MONTHS[sm]} {sy}
        </h2>

        <CalendarDayGroup
          title="Начинаются"
          records={selStarts}
          games={gamesMap}
          now={now}
        />
        <CalendarDayGroup
          title="Заканчиваются"
          records={selEnds}
          games={gamesMap}
          now={now}
        />
        <CalendarDayGroup
          title="Идут в этот день"
          records={spanning}
          games={gamesMap}
          now={now}
        />
      </div>
    </div>
  );
}

function CalendarDayGroup({
  title,
  records,
  games,
  now,
}: {
  title: string;
  records: ComputedRecord[];
  games: Map<string, Game>;
  now: number;
}) {
  if (records.length === 0) return null;
  return (
    <div className="space-y-2">
      <p className="text-muted text-sm font-medium">
        {title} · {records.length}
      </p>
      <div className="grid gap-3">
        {records.map((r) => (
          <RecordCard
            key={r.id}
            record={r}
            game={games.get(r.gameId)}
            now={now}
          />
        ))}
      </div>
    </div>
  );
}
