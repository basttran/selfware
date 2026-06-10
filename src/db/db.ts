import Dexie, { type EntityTable } from "dexie";
import { DEFAULT_SETTINGS, type Settings, type ThoughtRecord } from "@/db/types.ts";

/** Fixed primary key for the singleton settings row. */
export const SETTINGS_KEY = 1 as const;

interface SettingsRow extends Settings {
  id: typeof SETTINGS_KEY;
}

const db = new Dexie("selfware") as Dexie & {
  records: EntityTable<ThoughtRecord, "id">;
  settings: EntityTable<SettingsRow, "id">;
};

db.version(1).stores({
  records: "++id, status, createdAt, eventDate",
  settings: "id",
});

export { db };

/** Read the settings row, seeding defaults on first run. */
export async function getSettings(): Promise<Settings> {
  const row = await db.settings.get(SETTINGS_KEY);
  if (row) return row;
  await db.settings.put({ id: SETTINGS_KEY, ...DEFAULT_SETTINGS });
  return DEFAULT_SETTINGS;
}

/** Merge a partial update into the settings row. */
export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  await db.settings.put({ id: SETTINGS_KEY, ...current, ...patch });
}
