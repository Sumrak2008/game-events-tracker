import type { TrackerRecord } from "@/lib/types";

/** True if the record grants a confirmed premium currency. */
export function hasPremiumCurrency(r: TrackerRecord): boolean {
  return (
    Boolean(r.premiumCurrencyNameRu) ||
    Boolean(r.premiumCurrencyName) ||
    typeof r.premiumCurrencyAmount === "number"
  );
}

/** True if the record grants summon/wish currency (pulls, tickets). */
export function hasSummonCurrency(r: TrackerRecord): boolean {
  return (
    typeof r.summonCurrencyAmount === "number" ||
    r.rewardCategory === "pull_currency"
  );
}

const CHAR_WEAPON_RE =
  /персонаж|character|оруж|weapon|агент|agent|снаряж|equipment/i;

/** True if the record yields a character or weapon (banner or reward). */
export function grantsCharacterOrWeapon(r: TrackerRecord): boolean {
  if (
    r.type === "banner" &&
    (r.bannerSubtype === "character" || r.bannerSubtype === "weapon")
  ) {
    return true;
  }
  return Boolean(
    r.rewardCategory === "free_rare_reward" ||
    r.rewards?.some((x) => CHAR_WEAPON_RE.test(x)) ||
    CHAR_WEAPON_RE.test(r.rewardSummaryRu ?? r.rewardSummary ?? ""),
  );
}

/** First source URL, if any. */
export function primarySource(r: TrackerRecord): string | undefined {
  return r.sourceUrls?.[0] ?? r.sourceUrl;
}

export function premiumCurrencyText(r: TrackerRecord): string | undefined {
  if (!hasPremiumCurrency(r)) return undefined;
  const name =
    r.premiumCurrencyNameRu ?? r.premiumCurrencyName ?? "Премиум-валюта";
  return typeof r.premiumCurrencyAmount === "number"
    ? `${name} x${r.premiumCurrencyAmount}`
    : name;
}
