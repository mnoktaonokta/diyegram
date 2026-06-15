import {
  buildInitialDailyRecords,
  DEFAULT_MEAL_PLACEHOLDER_IMAGE,
  type DailyRecord,
} from "@/lib/mock/client-data";
import { todayKey } from "@/lib/utils/calendar";

import { idbGet, idbSet } from "@/lib/storage/idb-kv";

const RECORDS_KEY = "diyegram:client-day-records";
const LEGACY_SELECTED_DATE_KEY = "diyegram:client-selected-date";
const IDB_RECORDS_KEY = "client-day-records";

let migrationPromise: Promise<void> | null = null;

function stripInlineImages(
  records: Record<string, DailyRecord>,
): Record<string, DailyRecord> {
  return Object.fromEntries(
    Object.entries(records).map(([date, record]) => [
      date,
      {
        ...record,
        meals: record.meals.map((meal) => ({
          ...meal,
          images: meal.images.map((image) =>
            image.startsWith("data:") ? DEFAULT_MEAL_PLACEHOLDER_IMAGE : image,
          ),
        })),
      },
    ]),
  );
}

async function migrateLegacyLocalStorageRecords(): Promise<
  Record<string, DailyRecord> | null
> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(RECORDS_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Record<string, DailyRecord>;
    window.localStorage.removeItem(RECORDS_KEY);
    return parsed;
  } catch {
    window.localStorage.removeItem(RECORDS_KEY);
    return null;
  }
}

async function ensureMigrated(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  if (!migrationPromise) {
    migrationPromise = (async () => {
      const legacyRecords = await migrateLegacyLocalStorageRecords();
      if (!legacyRecords) {
        return;
      }

      const existing = await idbGet<Record<string, DailyRecord>>(IDB_RECORDS_KEY);
      if (!existing) {
        await idbSet(IDB_RECORDS_KEY, legacyRecords);
      }
    })();
  }

  await migrationPromise;
}

export async function loadClientDayRecords(): Promise<Record<
  string,
  DailyRecord
> | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    await ensureMigrated();
    return await idbGet<Record<string, DailyRecord>>(IDB_RECORDS_KEY);
  } catch {
    return null;
  }
}

export async function saveClientDayRecords(
  records: Record<string, DailyRecord>,
): Promise<boolean> {
  if (typeof window === "undefined") {
    return true;
  }

  try {
    await ensureMigrated();
    await idbSet(IDB_RECORDS_KEY, records);
    return true;
  } catch {
    try {
      await idbSet(IDB_RECORDS_KEY, stripInlineImages(records));
      return true;
    } catch {
      return false;
    }
  }
}

export function clearLegacySelectedDate() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(LEGACY_SELECTED_DATE_KEY);
}

export function getInitialClientDayRecords() {
  return buildInitialDailyRecords();
}

export function getInitialSelectedDate() {
  return todayKey();
}
