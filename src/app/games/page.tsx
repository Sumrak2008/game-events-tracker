import Link from "next/link";
import type { Metadata } from "next";

import { GameAvatar } from "@/components/GameAvatar";
import { GameCover } from "@/components/GameCover";
import { getTrackerData } from "@/lib/data";
import { computeGameStats } from "@/lib/gameStats";
import { getVisibleRecords } from "@/lib/visibility";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Игры" };

export default async function GamesPage() {
  const { games, records, now: serverNow } = await getTrackerData();
  const visible = getVisibleRecords(records, serverNow);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">Игры</h1>
        <p className="text-muted">
          {games.length} игр под отслеживанием. Выберите игру, чтобы увидеть ее
          актуальные и предстоящие баннеры, события и сезоны.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {games.map((game) => {
          const gameRecords = visible.filter((r) => r.gameId === game.id);
          const stats = computeGameStats(gameRecords, serverNow);
          return (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="card card-interactive hover:border-accent/60 group overflow-hidden hover:-translate-y-0.5"
            >
              <GameCover game={game} className="h-36">
                <div className="flex h-full flex-col justify-end p-4">
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
              <div className="flex flex-col gap-3 p-4">
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted">Активные события</dt>
                    <dd className="text-text font-semibold">
                      {stats.activeEvents}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted">Предстоящие события</dt>
                    <dd className="text-text font-semibold">
                      {stats.upcomingEvents}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted">Активные баннеры</dt>
                    <dd className="text-text font-semibold">
                      {stats.activeBanners}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted">Активные сезоны</dt>
                    <dd className="text-text font-semibold">
                      {stats.activeSeasons}
                    </dd>
                  </div>
                </dl>
                <div className="border-border/60 flex items-center justify-between border-t pt-2.5">
                  {stats.endingSoon > 0 ? (
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
            </Link>
          );
        })}
      </div>
    </div>
  );
}
