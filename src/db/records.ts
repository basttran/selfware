import { db } from "@/db/db.ts";
import type { ThoughtRecord } from "@/db/types.ts";

export type RecordDraft = Omit<ThoughtRecord, "id" | "createdAt" | "updatedAt">;

export function emptyDraft(): RecordDraft {
  return {
    status: "draft",
    event: "",
    emotions: [],
    automaticThoughts: "",
    supportingFacts: "",
    contradictingFacts: "",
    alternativeThoughts: "",
    distortions: [],
    currentStep: 0,
  };
}

/** Insert a new record, returning its generated id. */
export async function createRecord(draft: RecordDraft, now: number): Promise<number> {
  return (await db.records.add({ ...draft, createdAt: now, updatedAt: now })) as number;
}

/** Patch an existing record and bump updatedAt. */
export async function saveRecord(
  id: number,
  patch: Partial<ThoughtRecord>,
  now: number,
): Promise<void> {
  await db.records.update(id, { ...patch, updatedAt: now });
}

export async function getRecord(id: number): Promise<ThoughtRecord | undefined> {
  return db.records.get(id);
}

export async function deleteRecord(id: number): Promise<void> {
  await db.records.delete(id);
}

/** Records whose eventDate (fallback createdAt) falls within [from, to] inclusive. */
export async function recordsInRange(fromIso: string, toIso: string): Promise<ThoughtRecord[]> {
  const all = await db.records.orderBy("createdAt").toArray();
  return all.filter((r) => {
    const day = r.eventDate ?? new Date(r.createdAt).toISOString().slice(0, 10);
    return day >= fromIso && day <= toIso;
  });
}
