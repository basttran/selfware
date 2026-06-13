import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/app/SettingsProvider.tsx";
import { Button } from "@/components/Button.tsx";
import { hashPin, unlockWithPin } from "@/pin/pin.ts";

/**
 * Blocks the app behind a PIN when one is set. Unlock state lives in memory,
 * so a full reload re-locks. No PIN configured → renders children directly.
 */
export function PinGate({ children }: { children: ReactNode }) {
  const { pinHash } = useSettings();
  const { t } = useTranslation();
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  if (!pinHash || unlocked) return <>{children}</>;

  async function submit() {
    if ((await hashPin(code)) === pinHash) {
      await unlockWithPin(code);
      setUnlocked(true);
    } else {
      setError(true);
      setCode("");
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 p-8">
      <h1 className="font-semibold text-xl">{t("pin.title")}</h1>
      <input
        type="password"
        inputMode="numeric"
        autoComplete="off"
        aria-label={t("pin.prompt")}
        placeholder={t("pin.prompt")}
        value={code}
        onChange={(e) => {
          setError(false);
          setCode(e.target.value);
        }}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        className="w-48 rounded-control border border-border bg-surface-raised p-3 text-center text-lg tracking-widest outline-none focus:border-primary"
      />
      {error && <p className="text-danger text-sm">{t("settings.pin.wrong")}</p>}
      <Button onClick={submit} disabled={code.length === 0}>
        {t("pin.unlock")}
      </Button>
    </div>
  );
}
