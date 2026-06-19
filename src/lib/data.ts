import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { cache } from "react";

import type { Game, Source, TrackerRecord } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");

async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(path.join(DATA_DIR, file), "utf-8");
  return JSON.parse(raw) as T;
}

export interface TrackerData {
  games: Game[];
  records: TrackerRecord[];
  sources: Source[];
  /** Most recent verifiedAt across all records, in ms (null if none). */
  lastVerifiedMs: number | null;
  /**
   * Request time in ms. Captured here (outside any component) so pages get a
   * stable "now" for status computation without calling Date.now() during
   * render. Within one request it is consistent across layout and pages.
   */
  now: number;
}

/**
 * Loads all tracker data from the JSON files in /data. Records from the three
 * type files are merged into a single list — the `type` field on each record
 * identifies which kind it is.
 */
export const getTrackerData = cache(async (): Promise<TrackerData> => {
  const [games, banners, events, seasons, sources] = await Promise.all([
    readJson<Game[]>("games.json"),
    readJson<TrackerRecord[]>("banners.json"),
    readJson<TrackerRecord[]>("events.json"),
    readJson<TrackerRecord[]>("seasons.json"),
    readJson<Source[]>("sources.json"),
  ]);

  const records = [...banners, ...events, ...seasons];

  const lastVerifiedMs = records.reduce<number | null>((max, r) => {
    const t = Date.parse(r.verifiedAt);
    if (Number.isNaN(t)) return max;
    return max === null || t > max ? t : max;
  }, null);

  return { games, records, sources, lastVerifiedMs, now: Date.now() };
});

export function gamesById(games: Game[]): Map<string, Game> {
  return new Map(games.map((g) => [g.id, g]));
}
