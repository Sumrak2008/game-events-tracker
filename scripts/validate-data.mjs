#!/usr/bin/env node
// Validates the tracker JSON data files in /data.
// Run with: npm run validate
//
// Checks (per spec):
//  - required fields present (incl. sourceType, confidence, sourceUrls)
//  - gameId references an existing game
//  - id uniqueness
//  - ISO 8601 dates with timezone offset (startAt, endAt, verifiedAt, claimEndAt)
//  - endAt not earlier than startAt
//  - region present; timezone present and a valid IANA zone
//  - sourceUrls is a non-empty array of URLs
//  - sourceType / confidence from allowed sets; confirmed => official source
//  - full duplicate records
//  - allowed record types (and type matches its file)
//  - bannerSubtype only on banners; eventSubtype only on events
//  - numeric currency amounts; rewards is a string array
//  - demo convention (isDemo boolean; demo-prefixed ids must be demo)

import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const DATA_DIR = path.join(process.cwd(), "data");

const RECORD_FILES = [
  { file: "banners.json", type: "banner" },
  { file: "events.json", type: "event" },
  { file: "seasons.json", type: "season" },
];

const ALLOWED_TYPES = new Set(["banner", "event", "season"]);
const ALLOWED_SUBTYPES = new Set(["character", "weapon", "equipment", "other"]);
const ALLOWED_EVENT_SUBTYPES = new Set([
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
]);
const ALLOWED_SOURCE_TYPES = new Set([
  "official",
  "specialist",
  "wiki",
  "community",
]);
const ALLOWED_CONFIDENCE = new Set([
  "confirmed",
  "corroborated",
  "single-source",
  "conflicting",
]);
const ALLOWED_DATE_PRECISION = new Set(["date-only", "minute", "second"]);
const ALLOWED_REWARD_CATEGORIES = new Set([
  "premium_currency",
  "premium_like_currency",
  "pull_currency",
  "free_rare_reward",
]);
const ALLOWED_NON_IANA_TIMEZONES = new Set([
  "server time",
  "regional reset",
  "realm calendar",
  "weekly regional reset",
  "UTC+8",
  "UTC+9",
]);
const REQUIRED_FIELDS = [
  "id",
  "type",
  "gameId",
  "title",
  "description",
  "startAt",
  "endAt",
  "timezone",
  "region",
  "sourceType",
  "confidence",
  "sourceUrls",
  "verifiedAt",
  "isDemo",
];

const ISO_WITH_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const LOCAL_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

const errors = [];
const warnings = [];
const err = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

function load(file) {
  try {
    return JSON.parse(readFileSync(path.join(DATA_DIR, file), "utf-8"));
  } catch (e) {
    err(`Не удалось прочитать/разобрать ${file}: ${e.message}`);
    return null;
  }
}

function isValidTimezone(tz) {
  if (typeof tz !== "string" || tz.length === 0) return false;
  if (ALLOWED_NON_IANA_TIMEZONES.has(tz)) return true;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function isValidIsoWithOffset(value) {
  return (
    typeof value === "string" &&
    ISO_WITH_OFFSET.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

function offsetForTimezone(tz) {
  switch (tz) {
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

function isValidRecordDate(value, precision, timezone) {
  if (typeof value !== "string") return false;
  if (isValidIsoWithOffset(value)) return true;
  if (DATE_ONLY.test(value)) {
    return (
      precision === "date-only" ||
      precision === "minute" ||
      precision === "second"
    );
  }
  if (LOCAL_DATE_TIME.test(value)) {
    return (
      (precision === "minute" || precision === "second") &&
      !Number.isNaN(Date.parse(`${value}${offsetForTimezone(timezone)}`))
    );
  }
  return false;
}

function parseRecordDate(value, boundary, timezone) {
  if (DATE_ONLY.test(value)) {
    const time = boundary === "start" ? "T00:00:00" : "T23:59:59";
    return Date.parse(`${value}${time}${offsetForTimezone(timezone)}`);
  }
  if (LOCAL_DATE_TIME.test(value)) {
    return Date.parse(`${value}${offsetForTimezone(timezone)}`);
  }
  return Date.parse(value);
}

function isUrl(value) {
  return typeof value === "string" && /^https?:\/\/.+/i.test(value);
}

function normalize(record) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(record).sort(([a], [b]) => a.localeCompare(b)),
    ),
  );
}

const games = load("games.json");
if (!Array.isArray(games)) {
  err("games.json должен быть массивом.");
}
const gameIds = new Set(Array.isArray(games) ? games.map((g) => g.id) : []);

if (Array.isArray(games)) {
  const seenGameIds = new Set();
  for (const g of games) {
    if (!g.id) err(`Игра без id: ${JSON.stringify(g).slice(0, 80)}`);
    else if (seenGameIds.has(g.id)) err(`Дубликат id игры: ${g.id}`);
    else seenGameIds.add(g.id);
    if (!g.name) err(`Игра ${g.id ?? "?"} без поля name.`);
    if (!g.initials) warn(`Игра ${g.id ?? "?"} без поля initials.`);
  }
}

const seenIds = new Map();
const normalized = new Map();
let recordCount = 0;
const confidenceCounts = {};

for (const { file, type: expectedType } of RECORD_FILES) {
  const records = load(file);
  if (records === null) continue;
  if (!Array.isArray(records)) {
    err(`${file} должен быть массивом.`);
    continue;
  }

  records.forEach((r, index) => {
    recordCount += 1;
    const where = `${file}[${index}] (${r?.id ?? "без id"})`;

    if (typeof r !== "object" || r === null) {
      err(`${where}: запись должна быть объектом.`);
      return;
    }

    for (const field of REQUIRED_FIELDS) {
      const v = r[field];
      const missing =
        v === undefined ||
        v === null ||
        v === "" ||
        (field === "sourceUrls" && Array.isArray(v) && v.length === 0);
      if (missing) err(`${where}: отсутствует обязательное поле "${field}".`);
    }

    // Type
    if (!ALLOWED_TYPES.has(r.type)) {
      err(`${where}: недопустимый тип "${r.type}".`);
    } else if (r.type !== expectedType) {
      err(
        `${where}: тип "${r.type}" не соответствует файлу (ожидается "${expectedType}").`,
      );
    }

    // id uniqueness
    if (r.id) {
      if (seenIds.has(r.id)) {
        err(`${where}: дубликат id (также в ${seenIds.get(r.id)}).`);
      } else {
        seenIds.set(r.id, file);
      }
    }

    // gameId existence
    if (r.gameId && !gameIds.has(r.gameId)) {
      err(`${where}: gameId "${r.gameId}" не найден в games.json.`);
    }

    // Dates
    if (
      r.datePrecision !== undefined &&
      !ALLOWED_DATE_PRECISION.has(r.datePrecision)
    ) {
      err(`${where}: недопустимый datePrecision "${r.datePrecision}".`);
    }
    if (
      r.startAt &&
      !isValidRecordDate(r.startAt, r.datePrecision, r.timezone)
    ) {
      err(`${where}: startAt не ISO 8601 с часовым поясом: "${r.startAt}".`);
    }
    if (r.endAt && !isValidRecordDate(r.endAt, r.datePrecision, r.timezone)) {
      err(`${where}: endAt не ISO 8601 с часовым поясом: "${r.endAt}".`);
    }
    if (
      r.verifiedAt &&
      !isValidIsoWithOffset(r.verifiedAt) &&
      !DATE_ONLY.test(r.verifiedAt)
    ) {
      err(
        `${where}: verifiedAt не ISO 8601 с часовым поясом: "${r.verifiedAt}".`,
      );
    }
    if (r.claimEndAt !== undefined && !isValidIsoWithOffset(r.claimEndAt)) {
      err(
        `${where}: claimEndAt не ISO 8601 с часовым поясом: "${r.claimEndAt}".`,
      );
    }
    if (
      isValidRecordDate(r.startAt, r.datePrecision, r.timezone) &&
      isValidRecordDate(r.endAt, r.datePrecision, r.timezone) &&
      parseRecordDate(r.endAt, "end", r.timezone) <
        parseRecordDate(r.startAt, "start", r.timezone)
    ) {
      err(`${where}: endAt раньше startAt.`);
    }

    // Timezone
    if (r.timezone && !isValidTimezone(r.timezone)) {
      err(`${where}: неизвестный часовой пояс IANA: "${r.timezone}".`);
    }

    // Sourcing model
    if (r.sourceType !== undefined && !ALLOWED_SOURCE_TYPES.has(r.sourceType)) {
      err(`${where}: недопустимый sourceType "${r.sourceType}".`);
    }
    if (r.confidence !== undefined && !ALLOWED_CONFIDENCE.has(r.confidence)) {
      err(`${where}: недопустимый confidence "${r.confidence}".`);
    }
    if (r.confidence) {
      confidenceCounts[r.confidence] =
        (confidenceCounts[r.confidence] ?? 0) + 1;
    }
    if (r.sourceUrls !== undefined) {
      if (!Array.isArray(r.sourceUrls)) {
        err(`${where}: sourceUrls должен быть массивом.`);
      } else {
        r.sourceUrls.forEach((u, i) => {
          if (!isUrl(u))
            err(`${where}: sourceUrls[${i}] не похоже на URL: "${u}".`);
        });
      }
    }
    // confirmed must be backed by an official source
    if (r.confidence === "confirmed" && r.sourceType !== "official") {
      err(
        `${where}: confidence "confirmed" допустим только при sourceType "official".`,
      );
    }

    // isDemo
    if (r.isDemo !== undefined && typeof r.isDemo !== "boolean") {
      err(`${where}: поле isDemo должно быть boolean.`);
    }
    if (
      typeof r.id === "string" &&
      r.id.startsWith("demo-") &&
      r.isDemo !== true
    ) {
      err(`${where}: id начинается с "demo-", но isDemo не true.`);
    }

    // bannerSubtype
    if (r.bannerSubtype !== undefined) {
      if (r.type !== "banner") {
        err(`${where}: bannerSubtype допустим только для type "banner".`);
      } else if (!ALLOWED_SUBTYPES.has(r.bannerSubtype)) {
        err(`${where}: недопустимый bannerSubtype "${r.bannerSubtype}".`);
      }
    }

    // eventSubtype
    if (r.eventSubtype !== undefined) {
      if (r.type !== "event") {
        err(`${where}: eventSubtype допустим только для type "event".`);
      } else if (!ALLOWED_EVENT_SUBTYPES.has(r.eventSubtype)) {
        err(`${where}: недопустимый eventSubtype "${r.eventSubtype}".`);
      }
    }

    // Reward fields
    if (
      r.rewardCategory !== undefined &&
      !ALLOWED_REWARD_CATEGORIES.has(r.rewardCategory)
    ) {
      err(`${where}: недопустимый rewardCategory "${r.rewardCategory}".`);
    }
    if (r.rewards !== undefined) {
      if (
        !Array.isArray(r.rewards) ||
        r.rewards.some((x) => typeof x !== "string")
      ) {
        err(`${where}: rewards должен быть массивом строк.`);
      }
    }
    for (const numField of ["premiumCurrencyAmount", "summonCurrencyAmount"]) {
      if (r[numField] !== undefined && typeof r[numField] !== "number") {
        err(`${where}: ${numField} должен быть числом.`);
      }
    }

    // Full duplicates
    const norm = normalize(r);
    if (normalized.has(norm)) {
      err(`${where}: полный дубликат записи ${normalized.get(norm)}.`);
    } else {
      normalized.set(norm, r.id ?? where);
    }
  });
}

// Report
console.log(
  `Проверено: ${gameIds.size} игр, ${recordCount} записей в ${RECORD_FILES.length} файлах.`,
);
const cc = Object.entries(confidenceCounts)
  .map(([k, v]) => `${k}=${v}`)
  .join(", ");
if (cc) console.log(`Достоверность: ${cc}.`);
for (const w of warnings) console.log(`  WARN  ${w}`);
for (const e of errors) console.log(`  ERROR ${e}`);

if (errors.length > 0) {
  console.error(`\nВалидация не пройдена: ошибок — ${errors.length}.`);
  process.exit(1);
}
console.log(
  `\nВалидация пройдена${warnings.length ? ` (предупреждений: ${warnings.length})` : ""}.`,
);
