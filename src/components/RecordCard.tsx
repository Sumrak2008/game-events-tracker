import Link from "next/link";

import {
  ConfidenceBadge,
  DemoBadge,
  StatusBadge,
  TypeBadge,
} from "@/components/Badges";
import { Countdown } from "@/components/Countdown";
import { GameAvatar } from "@/components/GameAvatar";
import { GameCover } from "@/components/GameCover";
import { formatInZone } from "@/lib/format";
import { recordDescription, recordTitle } from "@/lib/localized";
import { DAY_MS } from "@/lib/status";
import type { ComputedRecord, Game, RecordType } from "@/lib/types";

const TYPE_ACCENT: Record<RecordType, string> = {
  banner: "before:bg-banner",
  event: "before:bg-event",
  season: "before:bg-season",
};

/**
 * The compact public card used everywhere records are listed. Deliberately
 * shows only the essentials (game, title, type, status, the one date that
 * matters right now, time left, a short description fragment) — everything
 * else (full reward breakdown, region, sources, verification notes) lives on
 * the record detail page. The whole card is a single link; there is no
 * second interactive element nested inside it.
 */
export function RecordCard({
  record,
  game,
  now,
}: {
  record: ComputedRecord;
  game?: Game;
  now: number;
}) {
  const urgent = record.status === "active" && record.endMs - now <= DAY_MS;
  const title = recordTitle(record);
  const showOriginalTitle =
    record.originalTitle && record.originalTitle !== title;
  const description = recordDescription(record);
  const mainDate =
    record.status === "upcoming"
      ? `Начало: ${formatInZone(record.startAt, record.timezone)}`
      : `Окончание: ${formatInZone(record.endAt, record.timezone)}`;

  return (
    <Link
      href={`/records/${record.id}`}
      className={`group card card-interactive relative flex flex-col overflow-hidden before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-1 before:content-[''] ${TYPE_ACCENT[record.type]} hover:border-accent/60 hover:-translate-y-0.5 ${
        urgent ? "ring-urgent/40 ring-1" : ""
      }`}
    >
      {game ? (
        <GameCover game={game} className="h-20">
          <div className="flex h-full items-start justify-between p-3">
            <div className="flex items-center gap-2">
              <GameAvatar game={game} size="sm" />
              <span className="text-sm font-semibold text-white drop-shadow">
                {game.name}
              </span>
            </div>
            <StatusBadge status={record.status} />
          </div>
        </GameCover>
      ) : (
        <div className="flex items-center justify-between p-3">
          <span className="text-muted text-sm">{record.gameId}</span>
          <StatusBadge status={record.status} />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <TypeBadge type={record.type} />
          <ConfidenceBadge confidence={record.confidence} />
          {record.isDemo ? <DemoBadge /> : null}
        </div>

        <div>
          <h3 className="text-text line-clamp-2 leading-snug font-semibold group-hover:text-white">
            {title}
          </h3>
          {showOriginalTitle ? (
            <p className="text-subtle mt-0.5 line-clamp-1 text-xs">
              {record.originalTitle}
            </p>
          ) : null}
        </div>

        <p className="text-muted line-clamp-1 text-sm">{description}</p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
          <Countdown record={record} now={now} />
          <span className="text-accent text-xs font-medium transition group-hover:translate-x-0.5">
            Подробнее →
          </span>
        </div>
        <p className="text-subtle text-xs">{mainDate}</p>
      </div>
    </Link>
  );
}
