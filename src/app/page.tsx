import Link from "next/link";

import { DemoNotice } from "@/components/DemoNotice";
import { HomeDashboard } from "@/components/HomeDashboard";
import { getTrackerData } from "@/lib/data";
import { ENDING_SOON_DAYS } from "@/lib/gameStats";
import { endsWithinDays } from "@/lib/status";
import { getVisibleRecords } from "@/lib/visibility";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const {
    records,
    games,
    lastVerifiedMs,
    now: serverNow,
  } = await getTrackerData();
  const hasDemo = records.some((r) => r.isDemo);

  // The hero counters and every section below only ever reflect publicly
  // visible (active/upcoming) records — completed records are excluded here
  // before any count is computed.
  const visible = getVisibleRecords(records, serverNow);
  const activeCount = visible.filter((r) => r.status === "active").length;
  const upcomingCount = visible.filter((r) => r.status === "upcoming").length;
  const endingSoonCount = visible.filter(
    (r) =>
      r.status === "active" && endsWithinDays(r, serverNow, ENDING_SOON_DAYS),
  ).length;

  return (
    <div className="space-y-8">
      <section className="glow-accent border-border relative overflow-hidden rounded-3xl border">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/art/hero.svg)" }}
        />
        <div
          aria-hidden="true"
          className="from-bg via-bg/80 to-bg/40 absolute inset-0 bg-gradient-to-r"
        />
        <div className="relative max-w-2xl space-y-5 p-7 sm:p-10">
          <span className="border-border bg-bg/40 text-muted inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
            {games.length} игр под отслеживанием
          </span>
          <h1 className="text-3xl leading-tight font-bold sm:text-4xl">
            <span className="text-gradient">Game Events Tracker</span> —
            баннеры, события и сезоны
          </h1>
          <p className="text-muted max-w-lg">
            Только то, что актуально прямо сейчас или скоро начнётся. Статусы
            вычисляются автоматически по текущему времени — завершённые записи в
            публичном интерфейсе не показываются.
          </p>
          <dl className="flex flex-wrap gap-2.5 text-sm">
            <div className="bg-active/15 text-active ring-active/30 rounded-lg px-3 py-1.5 font-semibold ring-1 ring-inset">
              <dd className="inline">{activeCount}</dd>{" "}
              <dt className="inline font-medium">активно</dt>
            </div>
            <div className="bg-upcoming/15 text-upcoming ring-upcoming/30 rounded-lg px-3 py-1.5 font-semibold ring-1 ring-inset">
              <dd className="inline">{upcomingCount}</dd>{" "}
              <dt className="inline font-medium">предстоит</dt>
            </div>
            <div className="bg-urgent/15 text-urgent ring-urgent/30 rounded-lg px-3 py-1.5 font-semibold ring-1 ring-inset">
              <dd className="inline">{endingSoonCount}</dd>{" "}
              <dt className="inline font-medium">скоро закончится</dt>
            </div>
          </dl>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="#section-active-events"
              className="bg-accent text-bg hover:bg-accent/90 inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold transition"
            >
              Актуальные события
            </Link>
            <Link
              href="/calendar"
              className="border-border-strong text-text hover:bg-surface-2 inline-flex h-10 items-center rounded-lg border px-4 text-sm font-semibold transition"
            >
              Открыть календарь
            </Link>
          </div>
        </div>
      </section>

      {hasDemo ? <DemoNotice /> : null}

      <HomeDashboard
        records={records}
        games={games}
        serverNow={serverNow}
        lastVerifiedMs={lastVerifiedMs}
      />
    </div>
  );
}
