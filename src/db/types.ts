/** Ekman's six primary emotions. Stable English ids; labels live in the i18n locale. */
export type PrimaryEmotion = "sadness" | "anger" | "fear" | "disgust" | "joy" | "surprise";

export const PRIMARY_EMOTIONS: readonly PrimaryEmotion[] = [
  "sadness",
  "anger",
  "fear",
  "disgust",
  "joy",
  "surprise",
] as const;

/** One felt emotion within a record: rated 1–10 before (initial) and after (result) the exercise. */
export interface Emotion {
  primary: PrimaryEmotion;
  /** Reserved for V2 (emotion wheel); never set in V1. */
  secondary?: string;
  /** 1–10, captured at step 2. */
  initialIntensity: number;
  /** 1–10, captured at step 7 (re-evaluation). */
  resultIntensity?: number;
}

export type RecordStatus = "draft" | "complete";

/** A Beck column entry ("colonne de Beck" / CBT thought record). */
export interface ThoughtRecord {
  id?: number;
  status: RecordStatus;
  /** Column 1 — the triggering event or memory. */
  event: string;
  /** Optional date of the triggering event (ISO yyyy-mm-dd), distinct from createdAt. */
  eventDate?: string;
  /** Optional time of the triggering event (HH:mm). */
  eventTime?: string;
  /** Columns 2 & 7 — emotions with before/after intensities. */
  emotions: Emotion[];
  /** Column 3. */
  automaticThoughts: string;
  /** Column 4 — facts supporting the automatic thought. */
  supportingFacts: string;
  /** Column 5 — facts contradicting the automatic thought. */
  contradictingFacts: string;
  /** Column 6 — more realistic alternative thoughts. */
  alternativeThoughts: string;
  /** Column 6 — selected cognitive distortion ids (see data/distortions). */
  distortions: string[];
  /** Wizard step to resume a draft at (0-based). */
  currentStep?: number;
  createdAt: number;
  updatedAt: number;
}

/** Singleton app settings (single row, fixed key in Dexie). */
export interface Settings {
  /** SHA-256 hex of the access PIN; undefined = no lock. */
  pinHash?: string;
  /** base64url-encoded 16-byte PBKDF2 salt; present iff a PIN is set. */
  encSalt?: string;
  /** Per-emotion color overrides (CSS color strings); missing keys use defaults. */
  emotionColors: Partial<Record<PrimaryEmotion, string>>;
  /** UI locale; only "fr" in V1. */
  locale: string;
}

/** A record stored encrypted in IndexedDB when a PIN is active. */
export interface EncryptedRecord {
  id?: number;
  /** base64url(IV[12 bytes] || AES-256-GCM ciphertext of JSON(ThoughtRecord without id)). */
  data: string;
}

export function isEncryptedRecord(r: ThoughtRecord | EncryptedRecord): r is EncryptedRecord {
  return "data" in r && !("event" in r);
}

export const DEFAULT_SETTINGS: Settings = {
  emotionColors: {},
  locale: "fr",
};
