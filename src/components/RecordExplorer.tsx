"use client";

import { useMemo, useState } from "react";

import { EmptyState } from "@/components/EmptyState";
import { RecordCard } from "@/components/RecordCard";
import {
  confidenceLabel,
  eventSubtypeLabel,
  statusLabel,
  typeLabel,
} from "@/lib/labels";
import {
  grantsCharacterOrWeapon,
  hasPremiumCurrency,
  hasSummonCurrency,
} from "@/lib/records";
import { computeRecords, sortRecords, type SortKey } from "@/lib/status";
import {
  CONFIDENCE_LEVELS,
  EVENT_SUBTYPES,
  RECORD_STATUSES,
  RECORD_TYPES,
  type Confidence,
  type EventSubtype,
  type Game,
  type RecordStatus,
  type RecordType,
  type TrackerRecord,
} from "@/lib/types";
import { useNow } from "@/lib/useNow";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "ending-soon", label: "По ближайшему окончанию" },
  { value: "starting-soon", label: "По ближайшему началу" },
  { value: "recently-ended", label: "Сначала недавно завершенные" },
];

function Field({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-border bg-surface text-text focus:border-accent rounded-lg border px-3 py-2 text-sm transition outline-none"
      >
        {children}
      </select>
    </label>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ring-inset ${
        active
          ? "bg-accent/20 text-text ring-accent/50"
          : "bg-surface text-muted ring-border hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

export function RecordExplorer({
  records,
  games,
  serverNow,
  showGameFilter = true,
  defaultSort = "ending-soon",
  emptyMessage = "Нет записей по заданным фильтрам.",
}: {
  records: TrackerRecord[];
  games: Game[];
  serverNow: number;
  showGameFilter?: boolean;
  defaultSort?: SortKey;
  emptyMessage?: string;
}) {
  const now = useNow(serverNow);

  const [gameId, setGameId] = useState("all");
  const [type, setType] = useState<RecordType | "all">("all");
  const [status, setStatus] = useState<RecordStatus | "all">("all");
  const [region, setRegion] = useState("all");
  const [confidence, setConfidence] = useState<Confidence | "all">("all");
  const [eventType, setEventType] = useState<EventSubtype | "all">("all");
  const [sort, setSort] = useState<SortKey>(defaultSort);
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [summonOnly, setSummonOnly] = useState(false);
  const [charWeaponOnly, setCharWeaponOnly] = useState(false);

  const gamesMap = useMemo(() => new Map(games.map((g) => [g.id, g])), [games]);

  const regions = useMemo(
    () => Array.from(new Set(records.map((r) => r.region))).sort(),
    [records],
  );

  const computed = useMemo(() => computeRecords(records, now), [records, now]);

  const filtered = useMemo(() => {
    return computed.filter((r) => {
      if (gameId !== "all" && r.gameId !== gameId) return false;
      if (type !== "all" && r.type !== type) return false;
      if (status !== "all" && r.status !== status) return false;
      if (region !== "all" && r.region !== region) return false;
      if (confidence !== "all" && r.confidence !== confidence) return false;
      if (eventType !== "all" && r.eventSubtype !== eventType) return false;
      if (premiumOnly && !hasPremiumCurrency(r)) return false;
      if (summonOnly && !hasSummonCurrency(r)) return false;
      if (charWeaponOnly && !grantsCharacterOrWeapon(r)) return false;
      return true;
    });
  }, [
    computed,
    gameId,
    type,
    status,
    region,
    confidence,
    eventType,
    premiumOnly,
    summonOnly,
    charWeaponOnly,
  ]);

  const main = useMemo(
    () =>
      sortRecords(
        filtered.filter((r) => r.confidence !== "conflicting"),
        sort,
      ),
    [filtered, sort],
  );
  const review = useMemo(
    () =>
      sortRecords(
        filtered.filter((r) => r.confidence === "conflicting"),
        sort,
      ),
    [filtered, sort],
  );

  return (
    <section className="space-y-4">
      <div className="card space-y-3 p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {showGameFilter ? (
            <Field label="Игра" value={gameId} onChange={setGameId}>
              <option value="all">Все игры</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Field>
          ) : null}
          <Field
            label="Тип"
            value={type}
            onChange={(v) => setType(v as RecordType | "all")}
          >
            <option value="all">Все типы</option>
            {RECORD_TYPES.map((t) => (
              <option key={t} value={t}>
                {typeLabel(t)}
              </option>
            ))}
          </Field>
          <Field
            label="Статус"
            value={status}
            onChange={(v) => setStatus(v as RecordStatus | "all")}
          >
            <option value="all">Любой статус</option>
            {RECORD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </Field>
          <Field label="Регион" value={region} onChange={setRegion}>
            <option value="all">Все регионы</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Field>
          <Field
            label="Достоверность"
            value={confidence}
            onChange={(v) => setConfidence(v as Confidence | "all")}
          >
            <option value="all">Любая</option>
            {CONFIDENCE_LEVELS.map((c) => (
              <option key={c} value={c}>
                {confidenceLabel(c)}
              </option>
            ))}
          </Field>
          <Field
            label="Тип события"
            value={eventType}
            onChange={(v) => setEventType(v as EventSubtype | "all")}
          >
            <option value="all">Все события</option>
            {EVENT_SUBTYPES.map((e) => (
              <option key={e} value={e}>
                {eventSubtypeLabel(e)}
              </option>
            ))}
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Toggle
            active={premiumOnly}
            onClick={() => setPremiumOnly((v) => !v)}
          >
            С премиум-валютой
          </Toggle>
          <Toggle active={summonOnly} onClick={() => setSummonOnly((v) => !v)}>
            С валютой призыва
          </Toggle>
          <Toggle
            active={charWeaponOnly}
            onClick={() => setCharWeaponOnly((v) => !v)}
          >
            С персонажем или оружием
          </Toggle>
          <div className="ml-auto">
            <Field
              label="Сортировка"
              value={sort}
              onChange={(v) => setSort(v as SortKey)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Field>
          </div>
        </div>
      </div>

      <p className="text-muted text-sm">Найдено записей: {main.length}</p>

      {main.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {main.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              game={gamesMap.get(record.gameId)}
              now={now}
            />
          ))}
        </div>
      )}

      {review.length > 0 ? (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <h3 className="text-urgent text-base font-semibold">
              Требует проверки
            </h3>
            <span className="bg-urgent/15 text-urgent rounded-full px-2 py-0.5 text-xs">
              {review.length}
            </span>
          </div>
          <p className="text-muted text-xs">
            Источники дают разные даты или условия. Эти записи не считаются
            подтвержденными.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {review.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                game={gamesMap.get(record.gameId)}
                now={now}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
