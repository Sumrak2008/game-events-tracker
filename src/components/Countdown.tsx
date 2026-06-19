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
    return (
      <span
        className={`${base} bg-upcoming/15 text-upcoming ring-upcoming/30 ring-1 ring-inset`}
      >
        Старт {formatRelative(record.startMs, now)}
      </span>
    );
  }

  return (
    <span
      className={`${base} bg-completed/10 text-completed ring-completed/25 ring-1 ring-inset`}
    >
      Завершилось {formatRelative(record.endMs, now)}
    </span>
  );
}
