import Link from "next/link";
import type { Metadata } from "next";

import { GameAvatar } from "@/components/GameAvatar";
import { GameCover } from "@/components/GameCover";
import { getTrackerData } from "@/lib/data";
import { computeStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Игры" };

export default async function GamesPage() {
  const { games, records, now: serverNow } = await getTrackerData();

  const stats = new Map(games.map((g) => [g.id, { total: 0, active: 0 }]));
  for (const r of records) {
    const s = stats.get(r.gameId);
    if (!s) continue;
    s.total += 1;
    if (computeStatus(r, serverNow) === "active") s.active += 1;
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">Игры</h1>
        <p className="text-muted">
          {games.length} игр под отслеживанием. Выберите игру, чтобы увидеть ее
          баннеры, события и сезоны.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => {
          const s = stats.get(game.id) ?? { total: 0, active: 0 };
          return (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="group card hover:border-accent/60 overflow-hidden transition duration-300 hover:-translate-y-0.5"
            >
              <GameCover game={game} className="h-44">
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
              <div className="flex items-center justify-between p-4 text-sm">
                <span className="text-muted">
                  <span className="text-active font-semibold">{s.active}</span>{" "}
                  активно · {s.total} всего
                </span>
                <span className="text-accent transition group-hover:translate-x-0.5">
                  Открыть →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
