export type RecordType = "banner" | "event" | "season";

export type BannerSubtype = "character" | "weapon" | "equipment" | "other";

export type RecordStatus = "upcoming" | "active" | "completed";

export type EventSubtype =
  | "major"
  | "challenge"
  | "login"
  | "web"
  | "limited-mode"
  | "reward-event"
  | "trial"
  | "story"
  | "co-op"
  | "raid"
  | "battle-pass"
  | "monthly-reward"
  | "returning-player"
  | "exploration"
  | "endgame-cycle"
  | "other";

export type DatePrecision = "date-only" | "minute" | "second";

export type RewardCategory =
  | "premium_currency"
  | "premium_like_currency"
  | "pull_currency"
  | "free_rare_reward";

/** Where the information came from, in descending order of authority. */
export type SourceType = "official" | "specialist" | "wiki" | "community";

/** How well the record's dates/conditions are backed by sources. */
export type Confidence =
  | "confirmed" // dates confirmed by an official source
  | "corroborated" // dates match in >= 2 independent non-official sources
  | "single-source" // only one acceptable third-party source
  | "conflicting"; // sources disagree on dates/conditions

export const RECORD_TYPES: RecordType[] = ["banner", "event", "season"];

export const BANNER_SUBTYPES: BannerSubtype[] = [
  "character",
  "weapon",
  "equipment",
  "other",
];

export const EVENT_SUBTYPES: EventSubtype[] = [
  "major",
  "challenge",
  "login",
  "web",
  "limited-mode",
  "reward-event",
  "trial",
  "story",
  "co-op",
  "raid",
  "battle-pass",
  "monthly-reward",
  "returning-player",
  "exploration",
  "endgame-cycle",
  "other",
];

export const RECORD_STATUSES: RecordStatus[] = [
  "upcoming",
  "active",
  "completed",
];

export const SOURCE_TYPES: SourceType[] = [
  "official",
  "specialist",
  "wiki",
  "community",
];

export const CONFIDENCE_LEVELS: Confidence[] = [
  "confirmed",
  "corroborated",
  "single-source",
  "conflicting",
];

export interface Game {
  id: string;
  name: string;
  shortName: string;
  initials: string;
  publisher?: string;
  colorFrom: string;
  colorTo: string;
  /**
   * Optional raster cover image (e.g. /art/games/uploads/genshin.jpg). When
   * absent, the app falls back to the original stylized SVG art at
   * /art/games/<id>.svg. This lets raster art replace the SVG later without
   * code changes.
   */
  imageUrl?: string;
}

export interface TrackerRecord {
  id: string;
  type: RecordType;
  gameId: string;
  title: string;
  titleRu?: string;
  originalTitle?: string;
  titleTranslation?: "official" | "editorial";
  description: string;
  descriptionRu?: string;
  /** ISO 8601 with timezone offset, e.g. 2026-06-19T22:00:00+08:00 */
  startAt: string;
  /** ISO 8601 with timezone offset */
  endAt: string;
  /** IANA timezone name, e.g. Asia/Shanghai */
  timezone: string;
  region: string;
  /** Source date precision when an event only has calendar-day boundaries. */
  datePrecision?: DatePrecision;

  // --- Sourcing & trustworthiness (new model) ---
  /** Highest-authority source category used for this record. */
  sourceType: SourceType;
  /** Confidence level of the dates/conditions. */
  confidence: Confidence;
  /** Every source URL consulted. The first one should be the strongest. */
  sourceUrls: string[];
  /** ISO 8601 timestamp of last verification against sources. */
  verifiedAt: string;
  /** Why the record is uncertain / how it was cross-checked. */
  verificationNote?: string;
  /**
   * @deprecated Kept for backwards compatibility. Prefer `sourceUrls`.
   */
  sourceUrl?: string;

  imageUrl?: string;
  isDemo: boolean;
  note?: string;
  noteRu?: string;

  // --- Banner-only ---
  /** Only meaningful when type === "banner" */
  bannerSubtype?: BannerSubtype;

  // --- Event-only (all optional) ---
  eventSubtype?: EventSubtype;
  /** Broad premium reward bucket for filters and reporting. */
  rewardCategory?: RewardCategory;
  /** List of notable rewards (free-form strings). */
  rewards?: string[];
  /** Short human summary of the rewards. */
  rewardSummary?: string;
  rewardSummaryRu?: string;
  /** Name of the premium currency granted, if confirmed (e.g. "Primogems"). */
  premiumCurrencyName?: string;
  premiumCurrencyNameRu?: string;
  /** Confirmed amount of premium currency. Never guess this. */
  premiumCurrencyAmount?: number;
  /** Confirmed amount of summon/wish currency (pulls/tickets equivalent). */
  summonCurrencyAmount?: number;
  /** Participation requirements (free-form). */
  requirements?: string;
  requirementsRu?: string;
  /** ISO 8601 deadline to claim rewards, if later than endAt. */
  claimEndAt?: string;
}

export interface Source {
  id: string;
  gameId: string;
  name: string;
  url: string;
  note?: string;
}

/** A record enriched with runtime-computed fields (never persisted). */
export interface ComputedRecord extends TrackerRecord {
  status: RecordStatus;
  startMs: number;
  endMs: number;
}
