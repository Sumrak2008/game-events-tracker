import Link from "next/link";

import {
  ConfidenceBadge,
  DemoBadge,
  EventSubtypeBadge,
  RegionBadge,
  StatusBadge,
  SubtypeBadge,
  TypeBadge,
} from "@/components/Badges";
import { Countdown } from "@/components/Countdown";
import { GameAvatar } from "@/components/GameAvatar";
import { GameCover } from "@/components/GameCover";
import { formatDateTimeRange } from "@/lib/format";
import {
  recordDescription,
  recordRewardSummary,
  recordTitle,
} from "@/lib/localized";
import {
  hasSummonCurrency,
  premiumCurrencyText,
  primarySource,
} from "@/lib/records";
import { DAY_MS } from "@/lib/status";
import type { ComputedRecord, Game, RecordType } from "@/lib/types";

const TYPE_ACCENT: Record<RecordType, string> = {
  banner: "before:bg-banner",
  event: "before:bg-event",
  season: "before:bg-season",
};

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
  const premium = premiumCurrencyText(record);
  const source = primarySource(record);
  const extraSources = Math.max(0, (record.sourceUrls?.length ?? 0) - 1);
  const title = recordTitle(record);
  const description = recordDescription(record);
  const rewardSummary = recordRewardSummary(record);

  return (
    <article
      className={`group card relative flex flex-col overflow-hidden transition duration-300 before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-1 before:content-[''] ${TYPE_ACCENT[record.type]} hover:border-accent/60 hover:-translate-y-0.5 ${
        urgent ? "ring-urgent/40 ring-1" : ""
      }`}
    >
      <Link href={`/records/${record.id}`} className="flex flex-1 flex-col">
        {game ? (
          <GameCover game={game} className="h-24">
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

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={record.type} />
            {record.type === "banner" && record.bannerSubtype ? (
              <SubtypeBadge subtype={record.bannerSubtype} />
            ) : null}
            {record.type === "event" && record.eventSubtype ? (
              <EventSubtypeBadge subtype={record.eventSubtype} />
            ) : null}
            <ConfidenceBadge confidence={record.confidence} />
          </div>

          <div>
            <h3 className="text-text leading-snug font-semibold group-hover:text-white">
              {title}
            </h3>
            <p className="text-muted mt-1 line-clamp-2 text-sm">
              {description}
            </p>
          </div>

          <div className="mt-auto space-y-2.5">
            <Countdown record={record} now={now} />

            {rewardSummary || premium || hasSummonCurrency(record) ? (
              <div className="space-y-1.5">
                {rewardSummary ? (
                  <p className="text-muted line-clamp-1 text-xs">
                    Награды: {rewardSummary}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-1.5">
                  {premium ? (
                    <span className="bg-event/15 text-event ring-event/30 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset">
                      Валюта: {premium}
                    </span>
                  ) : null}
                  {hasSummonCurrency(record) ? (
                    <span className="bg-banner/15 text-banner ring-banner/30 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset">
                      Призывы x{record.summonCurrencyAmount}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="text-muted flex items-center gap-1.5 text-xs">
              <span aria-hidden="true">·</span>
              <span>
                {formatDateTimeRange(
                  record.startAt,
                  record.endAt,
                  record.timezone,
                )}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <RegionBadge region={record.region} />
              {record.isDemo ? <DemoBadge /> : null}
            </div>
          </div>
        </div>
      </Link>

      {source ? (
        <div className="border-border/60 flex items-center gap-2 border-t px-4 py-2 text-xs">
          <a
            href={source}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-white"
          >
            Источник ↗
          </a>
          {extraSources > 0 ? (
            <span className="text-muted">+{extraSources}</span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
