import { DemoNotice } from "@/components/DemoNotice";
import { HomeDashboard } from "@/components/HomeDashboard";
import { getTrackerData } from "@/lib/data";
import { computeStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const {
    records,
    games,
    lastVerifiedMs,
    now: serverNow,
  } = await getTrackerData();
  const hasDemo = records.some((r) => r.isDemo);
  const activeCount = records.filter(
    (r) => computeStatus(r, serverNow) === "active",
  ).length;
  const upcomingCount = records.filter(
    (r) => computeStatus(r, serverNow) === "upcoming",
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
          className="from-bg via-bg/70 to-bg/30 absolute inset-0 bg-gradient-to-r"
        />
        <div className="relative max-w-2xl space-y-4 p-7 sm:p-10">
          <span className="border-border bg-bg/40 text-muted inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
            {games.length} игр · {records.length} записей
          </span>
          <h1 className="text-3xl leading-tight font-bold sm:text-4xl">
            <span className="text-gradient">Трекер</span> игровых баннеров,
            событий и сезонов
          </h1>
          <p className="text-muted">
            Отслеживайте, что идет сейчас и что скоро закончится, по нескольким
            играм. Статусы вычисляются автоматически по текущему времени.
          </p>
          <div className="flex flex-wrap gap-2.5 text-sm">
            <span className="bg-active/15 text-active ring-active/30 rounded-lg px-3 py-1.5 font-semibold ring-1 ring-inset">
              {activeCount} активно
            </span>
            <span className="bg-upcoming/15 text-upcoming ring-upcoming/30 rounded-lg px-3 py-1.5 font-semibold ring-1 ring-inset">
              {upcomingCount} впереди
            </span>
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
