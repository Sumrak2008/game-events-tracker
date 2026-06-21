"use client";

import { useMemo, useState } from "react";

import { EmptyState } from "@/components/EmptyState";
import { RecordCard } from "@/components/RecordCard";
import { RecordRow } from "@/components/RecordRow";
import { ViewModeToggle } from "@/components/ViewModeToggle";
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
import { recordDescription, recordTitle } from "@/lib/localized";
import { normalizeRegionLabel } from "@/lib/region";
import { sortRecords, type SortKey } from "@/lib/sort";
import { endsWithinDays } from "@/lib/status";
import {
  CONFIDENCE_LEVELS,
  EVENT_SUBTYPES,
  PUBLIC_RECORD_STATUSES,
  RECORD_TYPES,
  type Confidence,
  type ComputedRecord,
  type EventSubtype,
  type Game,
  type RecordStatus,
  type RecordType,
  type TrackerRecord,
} from "@/lib/types";
import { useNow } from "@/lib/useNow";
import { useViewMode } from "@/lib/useViewMode";
import { getVisibleRecords } from "@/lib/visibility";
import type { ViewMode } from "@/lib/viewMode";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "urgency", label: "Сначала заканчивающиеся" },
  { value: "starting-soon", label: "Сначала начинающиеся" },
  { value: "game", label: "По игре" },
  { value: "title", label: "По названию" },
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
        className="border-border bg-surface text-text focus:border-accent h-10 rounded-lg border px-3 text-sm transition outline-none"
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
      className={`flex h-10 min-h-10 items-center rounded-full px-3.5 text-xs font-medium ring-1 transition ring-inset ${
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
  defaultSort = "urgency",
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
  const [viewMode, setViewMode] = useViewMode();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [query, setQuery] = useState("");
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
  const [endingSoonOnly, setEndingSoonOnly] = useState(false);

  function resetFilters() {
    setQuery("");
    setGameId("all");
    setType("all");
    setStatus("all");
    setRegion("all");
    setConfidence("all");
    setEventType("all");
    setSort(defaultSort);
    setPremiumOnly(false);
    setSummonOnly(false);
    setCharWeaponOnly(false);
    setEndingSoonOnly(false);
  }

  // Counts only the discrete filter dimensions (not the free-text search or
  // the sort order) — shown on the mobile "Фильтры" toggle so the user knows
  // how many are active before expanding the panel.
  const activeFilterCount = [
    gameId !== "all",
    type !== "all",
    status !== "all",
    region !== "all",
    confidence !== "all",
    eventType !== "all",
    premiumOnly,
    summonOnly,
    charWeaponOnly,
    endingSoonOnly,
  ].filter(Boolean).length;

  const hasActiveFilters =
    query !== "" || activeFilterCount > 0 || sort !== defaultSort;

  const gamesMap = useMemo(() => new Map(games.map((g) => [g.id, g])), [games]);
  const gameNameById = useMemo(
    () => new Map(games.map((g) => [g.id, g.name])),
    [games],
  );

  const regions = useMemo(
    () =>
      Array.from(
        new Set(records.map((r) => normalizeRegionLabel(r.region))),
      ).sort(),
    [records],
  );

  const computed = useMemo(
    () => getVisibleRecords(records, now),
    [records, now],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return computed.filter((r) => {
      if (gameId !== "all" && r.gameId !== gameId) return false;
      if (type !== "all" && r.type !== type) return false;
      if (status !== "all" && r.status !== status) return false;
      if (region !== "all" && normalizeRegionLabel(r.region) !== region)
        return false;
      if (confidence !== "all" && r.confidence !== confidence) return false;
      if (eventType !== "all" && r.eventSubtype !== eventType) return false;
      if (premiumOnly && !hasPremiumCurrency(r)) return false;
      if (summonOnly && !hasSummonCurrency(r)) return false;
      if (charWeaponOnly && !grantsCharacterOrWeapon(r)) return false;
      if (endingSoonOnly && !endsWithinDays(r, now, 3)) return false;
      if (q) {
        const haystack = [
          recordTitle(r),
          r.title,
          r.originalTitle,
          recordDescription(r),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [
    computed,
    query,
    gameId,
    type,
    status,
    region,
    confidence,
    eventType,
    premiumOnly,
    summonOnly,
    charWeaponOnly,
    endingSoonOnly,
    now,
  ]);

  // `filtered` is derived from `computed`, which is already restricted to
  // publicly visible (active/upcoming) records via getVisibleRecords above —
  // so "review" below can never contain a completed record.
  const main = useMemo(
    () =>
      sortRecords(
        filtered.filter(
          (r) =>
            r.confidence !== "conflicting" && r.confidence !== "unverified",
        ),
        sort,
        gameNameById,
      ),
    [filtered, sort, gameNameById],
  );
  const review = useMemo(
    () =>
      sortRecords(
        filtered.filter(
          (r) =>
            r.confidence === "conflicting" || r.confidence === "unverified",
        ),
        sort,
        gameNameById,
      ),
    [filtered, sort, gameNameById],
  );

  return (
    <section className="space-y-4">
      <div className="card space-y-3 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-xs">
            <span className="text-muted">Поиск</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Название или описание…"
              aria-label="Поиск по названию или описанию"
              className="border-border bg-surface text-text placeholder:text-subtle focus:border-accent h-10 rounded-lg border px-3 text-sm transition outline-none"
            />
          </label>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="border-border text-muted hover:text-text hover:border-border-strong h-10 shrink-0 rounded-lg border px-3 text-sm transition"
            >
              Сбросить фильтры
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            aria-controls="record-explorer-filters"
            className="border-border text-text flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm transition sm:hidden"
          >
            Фильтры
            {activeFilterCount > 0 ? (
              <span className="bg-accent/20 text-accent rounded-full px-1.5 py-0.5 text-xs font-semibold">
                {activeFilterCount}
              </span>
            ) : null}
            <span aria-hidden="true">{filtersOpen ? "▲" : "▼"}</span>
          </button>
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        </div>
        <div
          id="record-explorer-filters"
          className={`${filtersOpen ? "flex" : "hidden"} flex-col gap-3 sm:flex`}
        >
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
              {PUBLIC_RECORD_STATUSES.map((s) => (
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
            <Toggle
              active={summonOnly}
              onClick={() => setSummonOnly((v) => !v)}
            >
              С валютой призыва
            </Toggle>
            <Toggle
              active={charWeaponOnly}
              onClick={() => setCharWeaponOnly((v) => !v)}
            >
              С персонажем или оружием
            </Toggle>
            <Toggle
              active={endingSoonOnly}
              onClick={() => setEndingSoonOnly((v) => !v)}
            >
              Скоро закончатся
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
      </div>

      <p className="text-muted text-sm">Найдено записей: {main.length}</p>

      {main.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <RecordList
          records={main}
          games={gamesMap}
          now={now}
          viewMode={viewMode}
        />
      )}

      {review.length > 0 ? (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <h2 className="text-urgent text-base font-semibold">
              Требует проверки
            </h2>
            <span className="bg-urgent/15 text-urgent rounded-full px-2 py-0.5 text-xs">
              {review.length}
            </span>
          </div>
          <p className="text-muted text-xs">
            Источники дают разные даты или условия. Эти записи не считаются
            подтвержденными.
          </p>
          <RecordList
            records={review}
            games={gamesMap}
            now={now}
            viewMode={viewMode}
          />
        </div>
      ) : null}
    </section>
  );
}

/**
 * Renders the same record set as either a card grid or a compact row list.
 * Both modes share identical filtering/sorting upstream — this only
 * controls presentation.
 */
function RecordList({
  records,
  games,
  now,
  viewMode,
}: {
  records: ComputedRecord[];
  games: Map<string, Game>;
  now: number;
  viewMode: ViewMode;
}) {
  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-2">
        {records.map((record) => (
          <RecordRow
            key={record.id}
            record={record}
            game={games.get(record.gameId)}
            now={now}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {records.map((record) => (
        <RecordCard
          key={record.id}
          record={record}
          game={games.get(record.gameId)}
          now={now}
        />
      ))}
    </div>
  );
}
