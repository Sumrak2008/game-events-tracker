"use client";

import Link from "next/link";
import { useMemo } from "react";

import { EmptyState } from "@/components/EmptyState";
import { GameAvatar } from "@/components/GameAvatar";
import { RecordCard } from "@/components/RecordCard";
import { SectionHeader } from "@/components/SectionHeader";
import { formatLocalDate } from "@/lib/format";
import { buildImportantNow } from "@/lib/importantNow";
import { sortRecords } from "@/lib/sort";
import type { ComputedRecord, Game, TrackerRecord } from "@/lib/types";
import { useFavoriteGames } from "@/lib/useFavoriteGames";
import { useNow } from "@/lib/useNow";
import { getVisibleRecords } from "@/lib/visibility";

function Section({
  id,
  title,
  icon,
  records,
  games,
  now,
  href,
  limit = 6,
  emptyText,
}: {
  id: string;
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
    <section aria-label={title} id={id} className="scroll-mt-20">
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
  const { favoriteIds } = useFavoriteGames();
  const favoriteGames = useMemo(
    () => games.filter((g) => favoriteIds.includes(g.id)),
    [games, favoriteIds],
  );
  const gamesMap = useMemo(() => new Map(games.map((g) => [g.id, g])), [games]);
  const gameNameById = useMemo(
    () => new Map(games.map((g) => [g.id, g.name])),
    [games],
  );

  const groups = useMemo(() => {
    // getVisibleRecords already excludes completed records and weapon
    // banners — every group below is built exclusively from records that
    // are allowed to be shown publicly.
    const visible = getVisibleRecords(records, now);
    const reviewable = visible.filter(
      (r) => r.confidence === "conflicting" || r.confidence === "unverified",
    );
    const confirmed = visible.filter(
      (r) => r.confidence !== "conflicting" && r.confidence !== "unverified",
    );
    const byUrgency = (list: ComputedRecord[]) =>
      sortRecords(list, "urgency", gameNameById);
    const active = confirmed.filter((r) => r.status === "active");

    return {
      importantNow: buildImportantNow(records, now, 6, gameNameById),
      events: byUrgency(active.filter((r) => r.type === "event")),
      banners: byUrgency(active.filter((r) => r.type === "banner")),
      seasons: byUrgency(active.filter((r) => r.type === "season")),
      upcoming: sortRecords(
        confirmed.filter((r) => r.status === "upcoming"),
        "starting-soon",
        gameNameById,
      ),
      review: byUrgency(reviewable),
    };
  }, [records, now, gameNameById]);

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

      <section aria-label="Важно сейчас" id="section-important-now">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-text text-lg font-semibold">Важно сейчас</h2>
            <span className="bg-surface-2 text-muted rounded-full px-2 py-0.5 text-xs">
              {groups.importantNow.length}
            </span>
          </div>
          <Link
            href="/ending-soon"
            className="text-accent text-sm transition hover:text-white"
          >
            Скоро закончатся →
          </Link>
        </div>
        {groups.importantNow.length === 0 ? (
          <EmptyState message="Сейчас нет ничего срочного — загляните позже." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.importantNow.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                game={gamesMap.get(record.gameId)}
                now={now}
              />
            ))}
          </div>
        )}
      </section>

      <Section
        id="section-active-events"
        title="Активные события"
        icon="С"
        records={groups.events}
        games={gamesMap}
        now={now}
        href="/ending-soon"
        emptyText="Нет активных событий."
      />
      <Section
        id="section-upcoming"
        title="Предстоящие события"
        icon="+"
        records={groups.upcoming}
        games={gamesMap}
        now={now}
        href="/calendar"
        emptyText="Нет предстоящих записей."
      />
      <Section
        id="section-banners"
        title="Активные баннеры"
        icon="Б"
        records={groups.banners}
        games={gamesMap}
        now={now}
        emptyText="Нет активных баннеров."
      />
      <Section
        id="section-seasons"
        title="Активные сезоны"
        icon="З"
        records={groups.seasons}
        games={gamesMap}
        now={now}
        emptyText="Нет текущих сезонов."
      />

      {favoriteGames.length > 0 ? (
        <section
          aria-label="Избранные игры"
          id="section-favorite-games"
          className="scroll-mt-20"
        >
          <SectionHeader
            title="Избранные игры"
            icon="★"
            count={favoriteGames.length}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {favoriteGames.map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="card hover:border-accent/60 flex items-center gap-3 p-3 transition hover:-translate-y-0.5"
              >
                <GameAvatar game={game} size="sm" />
                <span className="text-text truncate text-sm font-medium">
                  {game.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section aria-label="Игры" id="section-games" className="scroll-mt-20">
        <SectionHeader
          title="Игры"
          icon="G"
          count={games.length}
          href="/games"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="card hover:border-accent/60 flex items-center gap-3 p-3 transition hover:-translate-y-0.5"
            >
              <GameAvatar game={game} size="sm" />
              <span className="text-text truncate text-sm font-medium">
                {game.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {groups.review.length > 0 ? (
        <section
          aria-label="Требует проверки"
          id="section-review"
          className="scroll-mt-20"
        >
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-urgent text-lg font-semibold">
              Требует проверки
            </h2>
            <span className="bg-urgent/15 text-urgent rounded-full px-2 py-0.5 text-xs">
              {groups.review.length}
            </span>
          </div>
          <p className="text-muted mb-3 text-sm">
            Источники дают разные даты или условия. Записи активны или
            предстоят, но даты пока не подтверждены.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.review.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                game={gamesMap.get(record.gameId)}
                now={now}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
