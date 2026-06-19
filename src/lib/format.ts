import { DAY_MS } from "@/lib/status";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const LOCAL_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

function offsetForTimezone(timeZone: string): string {
  switch (timeZone) {
    case "UTC+8":
    case "Asia/Shanghai":
      return "+08:00";
    case "UTC+9":
    case "Asia/Seoul":
      return "+09:00";
    default:
      return "Z";
  }
}

function dateForDisplay(value: string, timeZone: string): Date {
  if (DATE_ONLY.test(value)) {
    return new Date(`${value}T12:00:00${offsetForTimezone(timeZone)}`);
  }
  if (LOCAL_DATE_TIME.test(value)) {
    return new Date(`${value}${offsetForTimezone(timeZone)}`);
  }
  return new Date(value);
}

function formatDateOnly(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dateForDisplay(value, timeZone));
}

export function formatInZone(iso: string, timeZone: string): string {
  if (DATE_ONLY.test(iso)) {
    return formatDateOnly(iso, timeZone);
  }
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
    }).format(dateForDisplay(iso, timeZone));
  } catch {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateForDisplay(iso, timeZone));
  }
}

export function formatLocalDate(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDateTimeRange(
  startIso: string,
  endIso: string,
  timeZone: string,
): string {
  const approx =
    DATE_ONLY.test(startIso) || DATE_ONLY.test(endIso)
      ? " (дата без точного времени)"
      : "";
  return `${formatInZone(startIso, timeZone)} - ${formatInZone(endIso, timeZone)}${approx}`;
}

export function formatRelative(targetMs: number, now: number): string {
  const diff = targetMs - now;
  const abs = Math.abs(diff);
  const minutes = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / DAY_MS);

  let value: string;
  if (abs < 60 * 60 * 1000) {
    value = `${Math.max(1, minutes)} мин`;
  } else if (abs < DAY_MS) {
    value = `${hours} ч`;
  } else {
    value = `${days} дн.`;
  }
  return diff >= 0 ? `через ${value}` : `${value} назад`;
}

export function formatTimeLeft(endMs: number, now: number): string {
  if (endMs <= now) return "завершилось";
  const abs = endMs - now;
  const minutes = Math.max(1, Math.round(abs / 60000));
  const hours = Math.floor(abs / 3600000);
  const days = Math.floor(abs / DAY_MS);
  if (abs < 60 * 60 * 1000) return `${minutes} мин`;
  if (abs < DAY_MS) return `${hours} ч`;
  const remHours = Math.floor((abs - days * DAY_MS) / 3600000);
  return remHours > 0 ? `${days} дн. ${remHours} ч` : `${days} дн.`;
}
