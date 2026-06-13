import { deriveKey } from "@/crypto/crypto.ts";
import { setKey } from "@/crypto/keystore.ts";
import { getSettings } from "@/db/db.ts";

/** SHA-256 hex digest of a PIN. Used as the UI access gate. */
export async function hashPin(pin: string): Promise<string> {
  const bytes = new TextEncoder().encode(pin);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Derive the AES key from the PIN and store it in the keystore. No-op if no encSalt. */
export async function unlockWithPin(pin: string): Promise<void> {
  const { encSalt } = await getSettings();
  if (!encSalt) return;
  const key = await deriveKey(pin, encSalt);
  setKey(key);
}
