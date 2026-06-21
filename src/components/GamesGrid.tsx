"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/EmptyState";
import { GameAvatar } from "@/components/GameAvatar";
import { GameCover } from "@/components/GameCover";
import { GameFavoriteToggle } from "@/components/GameFavoriteToggle";
import type { GameStats } from "@/lib/gameStats";
import type { Game } from "@/lib/types";
import { useFavoriteGames } from "@/lib/useFavoriteGames";

/**
 * Client-rendered grid of game cards. Takes already-computed per-game stats
 * as a prop (computed server-side from publicly visible records) and only
 * handles the client-only concern of favorites filtering/toggling.
 */
export function GamesGrid({
  games,
  statsByGameId,
}: {
  games: Game[];
  statsByGameId: Map<string, GameStats>;
}) {
  const { isFavorite } = useFavoriteGames();
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const visibleGames = useMemo(
    () => (favoritesOnly ? games.filter((g) => isFavorite(g.id)) : games),
    [games, favoritesOnly, isFavorite],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          type="button"
          aria-pressed={favoritesOnly}
          onClick={() => setFavoritesOnly((v) => !v)}
          className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium ring-1 transition ring-inset ${
            favoritesOnly
              ? "bg-warning/15 text-warning ring-warning/40"
              : "bg-surface text-muted ring-border hover:text-text"
          }`}
        >
          <span aria-hidden="true">{favoritesOnly ? "★" : "☆"}</span>
          Только избранные
        </button>
      </div>

      {visibleGames.length === 0 ? (
        <EmptyState message="Нет избранных игр. Отметьте игру звёздочкой на карточке, чтобы она появилась здесь." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleGames.map((game) => {
            const stats = statsByGameId.get(game.id);
            return (
              <div
                key={game.id}
                className="card card-interactive group relative overflow-hidden"
              >
                <Link
                  href={`/games/${game.id}`}
                  className="absolute inset-0 z-10"
                  aria-label={`Открыть ${game.name}`}
                />
                <div className="absolute top-3 right-3 z-20">
                  <GameFavoriteToggle
                    gameId={game.id}
                    gameName={game.name}
                    size="sm"
                  />
                </div>
                <GameCover game={game} className="pointer-events-none h-36">
                  <div className="flex h-full flex-col justify-end p-4 pr-14">
                    <div className="flex items-center gap-3">
                      <GameAvatar game={game} size="md" />
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-white drop-shadow">
                          {game.name}
                        </h2>
                        {game.publisher ? (
                          <p className="truncate text-xs text-white/75">
                            {game.publisher}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </GameCover>
                <div className="pointer-events-none flex flex-col gap-3 p-4">
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted">Активные события</dt>
                      <dd className="text-text font-semibold">
                        {stats?.activeEvents ?? 0}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted">Предстоящие события</dt>
                      <dd className="text-text font-semibold">
                        {stats?.upcomingEvents ?? 0}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted">Активные баннеры</dt>
                      <dd className="text-text font-semibold">
                        {stats?.activeBanners ?? 0}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted">Активные сезоны</dt>
                      <dd className="text-text font-semibold">
                        {stats?.activeSeasons ?? 0}
                      </dd>
                    </div>
                  </dl>
                  <div className="border-border/60 flex items-center justify-between border-t pt-2.5">
                    {stats && stats.endingSoon > 0 ? (
                      <span className="bg-urgent/15 text-urgent ring-urgent/30 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset">
                        {stats.endingSoon} скоро закончится
                      </span>
                    ) : (
                      <span className="text-subtle text-xs">
                        Ничего не заканчивается скоро
                      </span>
                    )}
                    <span className="text-accent text-sm transition group-hover:translate-x-0.5">
                      Открыть →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
