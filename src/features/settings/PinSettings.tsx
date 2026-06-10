import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/app/SettingsProvider.tsx";
import { Button } from "@/components/Button.tsx";
import { updateSettings } from "@/db/db.ts";
import { hashPin } from "@/pin/pin.ts";

export function PinSettings() {
  const { t } = useTranslation();
  const { pinHash } = useSettings();
  const [editing, setEditing] = useState(false);
  const [code, setCode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (code.length < 4) return;
    if (code !== confirm) {
      setError(t("settings.pin.mismatch"));
      return;
    }
    await updateSettings({ pinHash: await hashPin(code) });
    setEditing(false);
    setCode("");
    setConfirm("");
    setError(null);
  }

  async function disable() {
    await updateSettings({ pinHash: undefined });
  }

  return (
    <section className="rounded-card border border-border bg-surface-raised p-4">
      <h2 className="font-semibold text-sm">{t("settings.pin.title")}</h2>
      <p className="mt-1 mb-3 text-text-muted text-xs leading-relaxed">
        {t("settings.pin.description")}
      </p>

      {pinHash && !editing ? (
        <Button variant="danger" onClick={() => void disable()}>
          {t("settings.pin.disable")}
        </Button>
      ) : editing ? (
        <div className="space-y-2">
          <input
            type="password"
            inputMode="numeric"
            placeholder={t("settings.pin.enter")}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-control border border-border bg-surface p-2 text-sm"
          />
          <input
            type="password"
            inputMode="numeric"
            placeholder={t("settings.pin.confirm")}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-control border border-border bg-surface p-2 text-sm"
          />
          {error && <p className="text-danger text-xs">{error}</p>}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setEditing(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={() => void save()} disabled={code.length < 4}>
              {t("settings.pin.set")}
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="soft" onClick={() => setEditing(true)}>
          {t("settings.pin.enable")}
        </Button>
      )}
    </section>
  );
}
