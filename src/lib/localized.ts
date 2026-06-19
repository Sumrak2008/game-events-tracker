import type { TrackerRecord } from "@/lib/types";

export function recordTitle(record: TrackerRecord): string {
  return record.titleRu ?? record.title;
}

export function recordDescription(record: TrackerRecord): string {
  return record.descriptionRu ?? record.description;
}

export function recordRewardSummary(record: TrackerRecord): string | undefined {
  return record.rewardSummaryRu ?? record.rewardSummary;
}

export function recordRequirements(record: TrackerRecord): string | undefined {
  return record.requirementsRu ?? record.requirements;
}

export function recordNote(record: TrackerRecord): string | undefined {
  return record.noteRu ?? record.note;
}
