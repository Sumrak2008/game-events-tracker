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
  | "conflicting" // sources disagree on dates/conditions
  | "unverified"; // found, but could not yet be checked against any acceptable source

/** Role a registered source plays in the per-game discovery/verification pipeline. */
export type SourceRole = "discovery" | "verification" | "fallback";

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

/**
 * Statuses that may appear in public-facing filters. `completed` is
 * intentionally excluded — the site never shows completed records, so
 * offering it as a filter option would only ever produce empty results.
 */
export const PUBLIC_RECORD_STATUSES: RecordStatus[] = ["active", "upcoming"];

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
  "unverified",
];

export const SOURCE_ROLES: SourceRole[] = [
  "discovery",
  "verification",
  "fallback",
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
   * Optional override for the game's cover image. When absent, the cover is
   * resolved from the static slug map in `src/lib/game-visuals.ts`; when
   * neither is set, `GameVisual` renders a CSS gradient + initials
   * placeholder instead of requesting a missing file.
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

/**
 * One concrete source entry in a game's source registry. There is no single
 * universal source for every game — each entry plays a specific `role` in the
 * discovery → verification → fallback pipeline for that game.
 */
export interface GameSourceEntry {
  id: string;
  name: string;
  /** Root URL of the site (not necessarily the exact deep link). */
  baseUrl: string;
  role: SourceRole;
  sourceType: SourceType;
  /** Lower number = checked first within its role. */
  priority: number;
  supportsEvents: boolean;
  supportsBanners: boolean;
  supportsSeasons: boolean;
  supportsRewards: boolean;
  supportsRegionalDates: boolean;
  /** Set to false to temporarily exclude a source without deleting it. */
  enabled: boolean;
  notesRu?: string;
}

/** Per-game source registry: where to look, in what order, for what purpose. */
export interface GameSourceRegistry {
  gameId: string;
  discoverySources: GameSourceEntry[];
  verificationSources: GameSourceEntry[];
  fallbackSources: GameSourceEntry[];
  /** Cross-cutting collection rules for this game (what to include/exclude). */
  notesRu?: string;
}

/** A record enriched with runtime-computed fields (never persisted). */
export interface ComputedRecord extends TrackerRecord {
  status: RecordStatus;
  startMs: number;
  endMs: number;
}
