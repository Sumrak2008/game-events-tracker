import type {
  BannerSubtype,
  Confidence,
  EventSubtype,
  RecordStatus,
  RecordType,
} from "@/lib/types";
import {
  confidenceLabel,
  eventSubtypeLabel,
  statusLabel,
  subtypeLabel,
  typeLabel,
} from "@/lib/labels";

const BASE =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5";

const STATUS_CLASS: Record<RecordStatus, string> = {
  upcoming: "bg-upcoming/15 text-upcoming ring-1 ring-inset ring-upcoming/30",
  active: "bg-active/15 text-active ring-1 ring-inset ring-active/30",
  completed:
    "bg-completed/15 text-completed ring-1 ring-inset ring-completed/25",
};

const TYPE_CLASS: Record<RecordType, string> = {
  banner: "bg-banner/15 text-banner ring-1 ring-inset ring-banner/30",
  event: "bg-event/15 text-event ring-1 ring-inset ring-event/30",
  season: "bg-season/15 text-season ring-1 ring-inset ring-season/30",
};

export function StatusBadge({ status }: { status: RecordStatus }) {
  return (
    <span className={`${BASE} ${STATUS_CLASS[status]}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full bg-current ${
          status === "active" ? "animate-pulse-soft" : ""
        }`}
      />
      {statusLabel(status)}
    </span>
  );
}

export function TypeBadge({ type }: { type: RecordType }) {
  return (
    <span className={`${BASE} ${TYPE_CLASS[type]}`}>{typeLabel(type)}</span>
  );
}

export function SubtypeBadge({ subtype }: { subtype: BannerSubtype }) {
  return (
    <span
      className={`${BASE} bg-surface-2 text-muted ring-border ring-1 ring-inset`}
    >
      {subtypeLabel(subtype)}
    </span>
  );
}

export function RegionBadge({ region }: { region: string }) {
  return (
    <span
      className={`${BASE} bg-surface-2/60 text-muted ring-border ring-1 ring-inset`}
    >
      Регион: {region}
    </span>
  );
}

const CONFIDENCE_CLASS: Record<Confidence, string> = {
  confirmed: "bg-active/15 text-active ring-1 ring-inset ring-active/30",
  corroborated: "bg-season/15 text-season ring-1 ring-inset ring-season/30",
  "single-source":
    "bg-amber-400/10 text-amber-300 ring-1 ring-inset ring-amber-400/40",
  conflicting: "bg-urgent/15 text-urgent ring-1 ring-inset ring-urgent/40",
  unverified: "bg-surface-2 text-muted ring-border ring-1 ring-inset",
};

const CONFIDENCE_ICON: Record<Confidence, string> = {
  confirmed: "OK",
  corroborated: "OK",
  "single-source": "1",
  conflicting: "!",
  unverified: "?",
};

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return (
    <span
      className={`${BASE} ${CONFIDENCE_CLASS[confidence]}`}
      title="Уровень достоверности данных"
    >
      <span aria-hidden="true">{CONFIDENCE_ICON[confidence]}</span>
      {confidenceLabel(confidence)}
    </span>
  );
}

export function EventSubtypeBadge({ subtype }: { subtype: EventSubtype }) {
  return (
    <span
      className={`${BASE} bg-surface-2 text-muted ring-border ring-1 ring-inset`}
    >
      {eventSubtypeLabel(subtype)}
    </span>
  );
}

export function DemoBadge() {
  return (
    <span
      className={`${BASE} bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/50 ring-inset`}
      title="Демонстрационные или ориентировочные данные, не подтвержденные официально"
    >
      Демо-данные
    </span>
  );
}
