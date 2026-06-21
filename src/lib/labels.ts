import type {
  BannerSubtype,
  Confidence,
  EventSubtype,
  RecordStatus,
  RecordType,
  SourceType,
} from "@/lib/types";

export const TYPE_LABELS: Record<RecordType, string> = {
  banner: "Баннер",
  event: "Событие",
  season: "Сезон",
};

export const STATUS_LABELS: Record<RecordStatus, string> = {
  upcoming: "Скоро",
  active: "Активно",
  completed: "Завершено",
};

export const SUBTYPE_LABELS: Record<BannerSubtype, string> = {
  character: "Персонаж",
  weapon: "Оружие",
  equipment: "Снаряжение",
  other: "Другое",
};

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  confirmed: "Подтверждено",
  corroborated: "Несколько источников",
  "single-source": "Один сторонний источник",
  conflicting: "Требует проверки",
  unverified: "Не проверено",
};

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  official: "Официальный",
  specialist: "Профильный источник",
  wiki: "Вики",
  community: "Сообщество",
};

export const EVENT_SUBTYPE_LABELS: Record<EventSubtype, string> = {
  major: "Крупное событие",
  challenge: "Испытание",
  login: "Вход в игру",
  web: "Веб-событие",
  "limited-mode": "Ограниченный режим",
  "reward-event": "Событие с наградами",
  trial: "Пробное событие",
  story: "Сюжетное событие",
  "co-op": "Совместный режим",
  raid: "Рейд",
  "battle-pass": "Боевой пропуск",
  "monthly-reward": "Ежемесячная награда",
  "returning-player": "Для вернувшихся",
  exploration: "Исследование",
  "endgame-cycle": "Циклический эндгейм",
  other: "Другое",
};

export function typeLabel(type: RecordType): string {
  return TYPE_LABELS[type] ?? type;
}

export function confidenceLabel(confidence: Confidence): string {
  return CONFIDENCE_LABELS[confidence] ?? confidence;
}

export function sourceTypeLabel(sourceType: SourceType): string {
  return SOURCE_TYPE_LABELS[sourceType] ?? sourceType;
}

export function eventSubtypeLabel(subtype: EventSubtype): string {
  return EVENT_SUBTYPE_LABELS[subtype] ?? subtype;
}

export function statusLabel(status: RecordStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function subtypeLabel(subtype: BannerSubtype): string {
  return SUBTYPE_LABELS[subtype] ?? subtype;
}
