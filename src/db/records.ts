import { decryptRecord, encryptRecord } from "@/crypto/crypto.ts";
import { getKey } from "@/crypto/keystore.ts";
import { db } from "@/db/db.ts";
import { isEncryptedRecord, type ThoughtRecord } from "@/db/types.ts";

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

async function toPlaintext(row: ThoughtRecord | { id?: number; data: string }): Promise<ThoughtRecord | null> {
  if (isEncryptedRecord(row)) {
    const key = getKey();
    if (!key) return null;
    const record = await decryptRecord(key, row.data);
    return { ...record, id: row.id } as ThoughtRecord;
  }
  return row as ThoughtRecord;
}

/** Decrypt all rows and return as ThoughtRecord[]. Rows that can't be decrypted are skipped. */
export async function getAllRecords(): Promise<ThoughtRecord[]> {
  const stored = await db.records.toArray();
  const results = await Promise.all(stored.map((row) => toPlaintext(row)));
  return results.filter((r): r is ThoughtRecord => r !== null);
}

/** Insert a new record, returning its generated id. */
export async function createRecord(draft: RecordDraft, now: number): Promise<number> {
  const record: Omit<ThoughtRecord, "id"> = { ...draft, createdAt: now, updatedAt: now };
  const key = getKey();
  if (!key) {
    return (await db.records.add(record as ThoughtRecord)) as number;
  }
  const data = await encryptRecord(key, record);
  return (await db.records.add({ data } as { data: string })) as number;
}

/** Patch an existing record and bump updatedAt. */
export async function saveRecord(id: number, patch: Partial<ThoughtRecord>, now: number): Promise<void> {
  const key = getKey();
  if (!key) {
    await db.records.update(id, { ...patch, updatedAt: now } as Partial<ThoughtRecord>);
    return;
  }
  const stored = await db.records.get(id);
  if (!stored) return;
  const current = isEncryptedRecord(stored)
    ? await decryptRecord(key, stored.data)
    : (stored as Omit<ThoughtRecord, "id">);
  const updated: Omit<ThoughtRecord, "id"> = { ...(current as object), ...patch, updatedAt: now } as Omit<ThoughtRecord, "id">;
  const data = await encryptRecord(key, updated);
  await db.records.put({ id, data } as { id: number; data: string });
}

export async function getRecord(id: number): Promise<ThoughtRecord | undefined> {
  const stored = await db.records.get(id);
  if (!stored) return undefined;
  const record = await toPlaintext(stored);
  return record ?? undefined;
}

export async function deleteRecord(id: number): Promise<void> {
  await db.records.delete(id);
}

/** Records whose eventDate (fallback createdAt) falls within [from, to] inclusive. */
export async function recordsInRange(fromIso: string, toIso: string): Promise<ThoughtRecord[]> {
  const all = await getAllRecords();
  return all.filter((r) => {
    const day = r.eventDate ?? new Date(r.createdAt).toISOString().slice(0, 10);
    return day >= fromIso && day <= toIso;
  });
}

/** Encrypt all plaintext records in-place. Call after setting a new PIN. */
export async function encryptAllRecords(key: CryptoKey): Promise<void> {
  const stored = await db.records.toArray();
  const toEncrypt = stored.filter((r): r is ThoughtRecord => !isEncryptedRecord(r));
  const encrypted = await Promise.all(
    toEncrypt.map(async (row) => {
      const { id, ...rest } = row;
      const data = await encryptRecord(key, rest);
      return { id: id!, data };
    }),
  );
  await db.transaction("rw", db.records, async () => {
    for (const enc of encrypted) {
      await db.records.put(enc as { id: number; data: string });
    }
  });
}

/** Decrypt all encrypted records in-place. Call after removing a PIN. */
export async function decryptAllRecords(key: CryptoKey): Promise<void> {
  const stored = await db.records.toArray();
  const toDecrypt = stored.filter(isEncryptedRecord);
  const decrypted = await Promise.all(
    toDecrypt.map(async (row) => {
      const record = await decryptRecord(key, row.data);
      return { id: row.id!, ...record };
    }),
  );
  await db.transaction("rw", db.records, async () => {
    for (const rec of decrypted) {
      await db.records.put(rec as ThoughtRecord);
    }
  });
}
