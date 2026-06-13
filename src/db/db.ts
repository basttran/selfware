import Dexie, { type EntityTable, type Table } from "dexie";
import { DEFAULT_SETTINGS, type EncryptedRecord, type Settings, type ThoughtRecord } from "@/db/types.ts";

/** Fixed primary key for the singleton settings row. */
export const SETTINGS_KEY = 1 as const;

interface SettingsRow extends Settings {
  id: typeof SETTINGS_KEY;
}

const db = new Dexie("selfware") as Dexie & {
  records: Table<ThoughtRecord | EncryptedRecord, number>;
  settings: EntityTable<SettingsRow, "id">;
};

db.version(1).stores({
  records: "++id, status, createdAt, eventDate",
  settings: "id",
});

db.version(2).stores({
  records: "++id",
  settings: "id",
});

export { db };

/**
 * Read the settings row, falling back to defaults when absent.
 * READ-ONLY — safe to call inside a Dexie `liveQuery` querier (no writes there,
 * or liveQuery throws and crashes the React tree). The row is created lazily by
 * the first updateSettings() call.
 */
export async function getSettings(): Promise<Settings> {
  const row = await db.settings.get(SETTINGS_KEY);
  return row ?? { id: SETTINGS_KEY, ...DEFAULT_SETTINGS };
}

/** Merge a partial update into the settings row (creating it if needed). */
export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  await db.settings.put({ id: SETTINGS_KEY, ...current, ...patch });
}
