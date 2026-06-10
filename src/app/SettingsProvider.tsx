import { useLiveQuery } from "dexie-react-hooks";
import { createContext, type ReactNode, use, useEffect } from "react";
import { getSettings } from "@/db/db.ts";
import { DEFAULT_SETTINGS, type Settings } from "@/db/types.ts";
import { applyEmotionColors } from "@/theme/theme.ts";

const SettingsContext = createContext<Settings | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settings = useLiveQuery(() => getSettings(), [], DEFAULT_SETTINGS);

  useEffect(() => {
    applyEmotionColors(settings.emotionColors);
  }, [settings.emotionColors]);

  return <SettingsContext value={settings}>{children}</SettingsContext>;
}

export function useSettings(): Settings {
  const ctx = use(SettingsContext);
  if (!ctx) throw new Error("useSettings doit être utilisé dans <SettingsProvider>");
  return ctx;
}
