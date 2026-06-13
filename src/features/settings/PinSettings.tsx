import { useState } from "react";
import { useTranslation } from "react-i18next";
import { generateSalt, deriveKey } from "@/crypto/crypto.ts";
import { clearKey, getKey, setKey } from "@/crypto/keystore.ts";
import { useSettings } from "@/app/SettingsProvider.tsx";
import { Button } from "@/components/Button.tsx";
import { getSettings, updateSettings } from "@/db/db.ts";
import { decryptAllRecords, encryptAllRecords } from "@/db/records.ts";
import { hashPin } from "@/pin/pin.ts";

type Mode = "idle" | "setting" | "changing";

export function PinSettings() {
  const { t } = useTranslation();
  const { pinHash } = useSettings();
  const [mode, setMode] = useState<Mode>("idle");
  const [busy, setBusy] = useState(false);

  const [currentCode, setCurrentCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setCurrentCode("");
    setNewCode("");
    setConfirmCode("");
    setError(null);
  }

  function cancel() {
    setMode("idle");
    reset();
  }

  async function setPin() {
    if (newCode.length < 4) return;
    if (newCode !== confirmCode) {
      setError(t("settings.pin.mismatch"));
      return;
    }
    setBusy(true);
    try {
      const salt = generateSalt();
      const key = await deriveKey(newCode, salt);
      await encryptAllRecords(key);
      setKey(key);
      await updateSettings({ pinHash: await hashPin(newCode), encSalt: salt });
      setMode("idle");
      reset();
    } finally {
      setBusy(false);
    }
  }

  async function changePin() {
    if (newCode !== confirmCode) {
      setError(t("settings.pin.mismatch"));
      return;
    }
    if (newCode.length < 4) return;
    setBusy(true);
    try {
      const settings = await getSettings();
      if ((await hashPin(currentCode)) !== settings.pinHash) {
        setError(t("settings.pin.wrong"));
        return;
      }
      const oldKey = getKey();
      if (oldKey) await decryptAllRecords(oldKey);
      const salt = generateSalt();
      const key = await deriveKey(newCode, salt);
      await encryptAllRecords(key);
      setKey(key);
      await updateSettings({ pinHash: await hashPin(newCode), encSalt: salt });
      setMode("idle");
      reset();
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const key = getKey();
      if (key) await decryptAllRecords(key);
      clearKey();
      await updateSettings({ pinHash: undefined, encSalt: undefined });
    } finally {
      setBusy(false);
    }
  }

  const inputClass = "w-full rounded-control border border-border bg-surface p-2 text-sm";

  return (
    <section className="rounded-card border border-border bg-surface-raised p-4">
      <h2 className="font-semibold text-sm">{t("settings.pin.title")}</h2>
      <p className="mt-1 mb-3 text-text-muted text-xs leading-relaxed">
        {t("settings.pin.description")}
      </p>

      {mode === "idle" && !pinHash && (
        <Button variant="soft" onClick={() => setMode("setting")} disabled={busy}>
          {t("settings.pin.enable")}
        </Button>
      )}

      {mode === "idle" && pinHash && (
        <div className="flex flex-wrap gap-2">
          <Button variant="soft" onClick={() => setMode("changing")} disabled={busy}>
            {t("settings.pin.change")}
          </Button>
          <Button variant="danger" onClick={() => void disable()} disabled={busy}>
            {busy ? t("settings.pin.working") : t("settings.pin.disable")}
          </Button>
        </div>
      )}

      {mode === "setting" && (
        <div className="space-y-2">
          <input
            type="password"
            inputMode="numeric"
            placeholder={t("settings.pin.new")}
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            inputMode="numeric"
            placeholder={t("settings.pin.confirm")}
            value={confirmCode}
            onChange={(e) => setConfirmCode(e.target.value)}
            className={inputClass}
          />
          {error && <p className="text-danger text-xs">{error}</p>}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={cancel} disabled={busy}>
              {t("common.cancel")}
            </Button>
            <Button onClick={() => void setPin()} disabled={newCode.length < 4 || busy}>
              {busy ? t("settings.pin.working") : t("settings.pin.set")}
            </Button>
          </div>
        </div>
      )}

      {mode === "changing" && (
        <div className="space-y-2">
          <input
            type="password"
            inputMode="numeric"
            placeholder={t("settings.pin.current")}
            value={currentCode}
            onChange={(e) => setCurrentCode(e.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            inputMode="numeric"
            placeholder={t("settings.pin.new")}
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            inputMode="numeric"
            placeholder={t("settings.pin.confirm")}
            value={confirmCode}
            onChange={(e) => setConfirmCode(e.target.value)}
            className={inputClass}
          />
          {error && <p className="text-danger text-xs">{error}</p>}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={cancel} disabled={busy}>
              {t("common.cancel")}
            </Button>
            <Button onClick={() => void changePin()} disabled={currentCode.length < 4 || newCode.length < 4 || busy}>
              {busy ? t("settings.pin.working") : t("settings.pin.change")}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
