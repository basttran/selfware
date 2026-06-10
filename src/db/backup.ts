import { z } from "zod";
import { db, SETTINGS_KEY } from "@/db/db.ts";
import { PRIMARY_EMOTIONS } from "@/db/types.ts";

const BACKUP_VERSION = 1;

const emotionSchema = z.object({
  primary: z.enum(PRIMARY_EMOTIONS),
  secondary: z.string().optional(),
  initialIntensity: z.number().min(1).max(10),
  resultIntensity: z.number().min(1).max(10).optional(),
});

const recordSchema = z.object({
  id: z.number().optional(),
  status: z.enum(["draft", "complete"]),
  event: z.string(),
  eventDate: z.string().optional(),
  eventTime: z.string().optional(),
  emotions: z.array(emotionSchema),
  automaticThoughts: z.string(),
  supportingFacts: z.string(),
  contradictingFacts: z.string(),
  alternativeThoughts: z.string(),
  distortions: z.array(z.string()),
  currentStep: z.number().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const settingsSchema = z.object({
  pinHash: z.string().optional(),
  emotionColors: z.partialRecord(z.enum(PRIMARY_EMOTIONS), z.string()),
  locale: z.string(),
});

const backupSchema = z.object({
  version: z.literal(BACKUP_VERSION),
  exportedAt: z.number(),
  records: z.array(recordSchema),
  settings: settingsSchema,
});

export type Backup = z.infer<typeof backupSchema>;

/** Serialize all records + settings to a downloadable JSON string. */
export async function exportJSON(exportedAt: number): Promise<string> {
  const [records, settingsRow] = await Promise.all([
    db.records.toArray(),
    db.settings.get(SETTINGS_KEY),
  ]);
  const { id: _id, ...settings } = settingsRow ?? {
    id: SETTINGS_KEY,
    emotionColors: {},
    locale: "fr",
  };
  const backup: Backup = { version: BACKUP_VERSION, exportedAt, records, settings };
  return JSON.stringify(backup, null, 2);
}

/** Validate and restore a backup, replacing all existing data. Throws on invalid input. */
export async function importJSON(raw: string): Promise<void> {
  const parsed = backupSchema.parse(JSON.parse(raw));
  await db.transaction("rw", db.records, db.settings, async () => {
    await db.records.clear();
    await db.records.bulkAdd(parsed.records.map(({ id: _id, ...rest }) => rest));
    await db.settings.put({ id: SETTINGS_KEY, ...parsed.settings });
  });
}
