"use client";

import { useMemo, useState } from "react";

import { EmptyState } from "@/components/EmptyState";
import { RecordCard } from "@/components/RecordCard";
import {
  dayKey,
  groupRecordsByDay,
  recordsInMonth,
  recordsOnDay,
} from "@/lib/calendar";
import type { Game, TrackerRecord } from "@/lib/types";
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
  const gameNameById = useMemo(
    () => new Map(games.map((g) => [g.id, g.name])),
    [games],
  );
  // Completed records and weapon banners never appear on the calendar —
  // getVisibleRecords keeps only publicly visible records before any
  // start/end grouping or day/month list is built.
  const computed = useMemo(
    () => getVisibleRecords(records, now),
    [records, now],
  );

  const today = new Date(now);
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  // null = no specific day selected, showing the whole month's records below.
  const [selected, setSelected] = useState<string | null>(null);

  const { starts, ends } = useMemo(
    () => groupRecordsByDay(computed),
    [computed],
  );

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
    setSelected(null);
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function selectDay(day: number) {
    const key = dayKey(view.year, view.month, day);
    setSelected((prev) => (prev === key ? null : key));
  }

  // The site has no archive — browsing into a fully past month would only
  // ever show empty markers (completed records are filtered out above), so
  // the "previous month" control is disabled once the current month is
  // reached.
  const isCurrentMonth =
    view.year === today.getFullYear() && view.month === today.getMonth();
  const canGoToPreviousMonth = !isCurrentMonth;

  const [sy, sm, sd] = (selected ?? "0-0-0").split("-").map(Number);
  const dayRecords = selected
    ? recordsOnDay(computed, sy, sm, sd, gameNameById)
    : [];
  const monthRecords = useMemo(
    () => recordsInMonth(computed, view.year, view.month, gameNameById),
    [computed, view.year, view.month, gameNameById],
  );

  const listTitle = selected
    ? `События ${sd} ${MONTHS[sm]} ${sy}`
    : `Записи за ${MONTHS[view.month].toLowerCase()}`;
  const listRecords = selected ? dayRecords : monthRecords;
  const emptyText = selected
    ? "В этот день нет актуальных записей."
    : "В выбранном месяце нет актуальных записей.";

  return (
    <div className="space-y-6">
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
              onClick={() => {
                setSelected(null);
                setView({ year: today.getFullYear(), month: today.getMonth() });
              }}
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
                onClick={() => selectDay(day)}
                aria-current={isToday ? "date" : undefined}
                aria-pressed={isSelected}
                aria-label={`${day} ${MONTHS[view.month]}${summary ? `, ${summary}` : ""}`}
                className={`flex aspect-square flex-col items-center justify-start rounded-lg border p-1 text-xs transition sm:p-1.5 ${
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
                      ▲{nStart}
                    </span>
                  ) : null}
                  {nEnd > 0 ? (
                    <span
                      className="bg-event/20 text-event rounded px-1 text-[10px]"
                      title={`Заканчивается: ${nEnd}`}
                    >
                      ▼{nEnd}
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
            <span className="text-upcoming">▲</span>
            начинается
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-event">▼</span>
            заканчивается
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="border-accent/60 bg-surface h-2.5 w-2.5 rounded border" />
            сегодня
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">{listTitle}</h2>
          {selected ? (
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-accent text-sm transition hover:text-white"
            >
              ← Показать весь месяц
            </button>
          ) : null}
        </div>

        {listRecords.length === 0 ? (
          <EmptyState message={emptyText} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listRecords.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                game={gamesMap.get(record.gameId)}
                now={now}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
