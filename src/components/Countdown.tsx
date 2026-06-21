import { formatRelative, formatTimeLeft } from "@/lib/format";
import { DAY_MS } from "@/lib/status";
import type { ComputedRecord } from "@/lib/types";

export function Countdown({
  record,
  now,
  size = "sm",
}: {
  record: ComputedRecord;
  now: number;
  size?: "sm" | "md";
}) {
  const pad = size === "md" ? "px-3 py-1 text-sm" : "px-2.5 py-1 text-xs";
  const base = `inline-flex items-center gap-1.5 rounded-lg font-semibold ${pad}`;

  if (record.status === "active") {
    const urgent = record.endMs - now <= DAY_MS;
    const cls = urgent
      ? "bg-urgent/15 text-urgent ring-1 ring-inset ring-urgent/40"
      : "bg-active/15 text-active ring-1 ring-inset ring-active/30";
    return (
      <span className={`${base} ${cls}`}>
        {urgent ? "Срочно: " : "Осталось: "}
        {formatTimeLeft(record.endMs, now)}
      </span>
    );
  }

  if (record.status === "upcoming") {
    const soon = record.startMs - now <= DAY_MS * 3;
    const cls = soon
      ? "bg-urgent/15 text-urgent ring-1 ring-inset ring-urgent/40"
      : "bg-upcoming/15 text-upcoming ring-upcoming/30 ring-1 ring-inset";
    return (
      <span className={`${base} ${cls}`}>
        {soon ? "Скоро начнётся: " : "Старт "}
        {formatRelative(record.startMs, now)}
      </span>
    );
  }

  // The public UI never renders completed records (see getVisibleRecords),
  // but this branch is kept so the component stays correct if ever reused
  // for an internal/admin view of the full record set.
  return (
    <span
      className={`${base} bg-completed/10 text-completed ring-completed/25 ring-1 ring-inset`}
    >
      Завершилось {formatRelative(record.endMs, now)}
    </span>
  );
}
