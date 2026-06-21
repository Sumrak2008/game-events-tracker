import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { DemoNotice } from "@/components/DemoNotice";
import { EmptyState } from "@/components/EmptyState";
import { GameAvatar } from "@/components/GameAvatar";
import { GameCover } from "@/components/GameCover";
import { GameFavoriteToggle } from "@/components/GameFavoriteToggle";
import { RecordExplorer } from "@/components/RecordExplorer";
import { getTrackerData } from "@/lib/data";
import { formatLocalDate } from "@/lib/format";
import { computeGameStats } from "@/lib/gameStats";
import { getVisibleRecords } from "@/lib/visibility";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ gameId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { gameId } = await params;
  const { games } = await getTrackerData();
  const game = games.find((g) => g.id === gameId);
  return { title: game ? game.name : "Игра" };
}

export default async function GamePage({ params }: Params) {
  const { gameId } = await params;
  const { games, records, now: serverNow } = await getTrackerData();
  const game = games.find((g) => g.id === gameId);
  if (!game) notFound();

  const allGameRecords = records.filter((r) => r.gameId === game.id);
  const visibleGameRecords = getVisibleRecords(allGameRecords, serverNow);
  const stats = computeGameStats(visibleGameRecords, serverNow);
  const hasDemo = visibleGameRecords.some((r) => r.isDemo);

  return (
    <div className="space-y-6">
      <Link href="/games" className="text-accent text-sm hover:text-white">
        ← Все игры
      </Link>

      <GameCover
        game={game}
        zoom={false}
        className="border-border h-56 rounded-2xl border sm:h-64"
      >
        <header className="flex h-full items-end justify-between gap-4 p-6">
          <div className="flex items-end gap-4">
            <GameAvatar game={game} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow sm:text-3xl">
                {game.name}
              </h1>
              {game.publisher ? (
                <p className="text-sm text-white/75">
                  Баннеры, события и сезоны · {game.publisher}
                </p>
              ) : null}
            </div>
          </div>
          <GameFavoriteToggle gameId={game.id} gameName={game.name} />
        </header>
      </GameCover>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="card p-3 text-center">
          <dd className="text-active text-xl font-bold">
            {stats.activeEvents + stats.activeBanners + stats.activeSeasons}
          </dd>
          <dt className="text-muted text-xs">Активных записей</dt>
        </div>
        <div className="card p-3 text-center">
          <dd className="text-upcoming text-xl font-bold">
            {stats.upcomingEvents +
              stats.upcomingBanners +
              stats.upcomingSeasons}
          </dd>
          <dt className="text-muted text-xs">Предстоящих</dt>
        </div>
        <div className="card p-3 text-center">
          <dd className="text-banner text-xl font-bold">
            {stats.activeBanners}
          </dd>
          <dt className="text-muted text-xs">Активных баннеров</dt>
        </div>
        <div className="card p-3 text-center">
          <dd className="text-urgent text-xl font-bold">{stats.endingSoon}</dd>
          <dt className="text-muted text-xs">Скоро закончится</dt>
        </div>
        <div className="card col-span-2 p-3 text-center sm:col-span-1">
          <dd className="text-text text-sm font-semibold">
            {stats.nearestEndMs
              ? formatLocalDate(new Date(stats.nearestEndMs).toISOString())
              : "—"}
          </dd>
          <dt className="text-muted text-xs">Ближайшее завершение</dt>
        </div>
      </dl>

      {hasDemo ? <DemoNotice /> : null}

      {visibleGameRecords.length === 0 ? (
        <EmptyState message="У этой игры сейчас нет активных или предстоящих записей." />
      ) : (
        <RecordExplorer
          records={visibleGameRecords}
          games={games}
          serverNow={serverNow}
          showGameFilter={false}
          emptyMessage="Для этой игры нет записей по заданным фильтрам."
        />
      )}
    </div>
  );
}
