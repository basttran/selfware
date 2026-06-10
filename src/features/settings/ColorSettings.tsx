import { useTranslation } from "react-i18next";
import { useSettings } from "@/app/SettingsProvider.tsx";
import { EMOTIONS } from "@/data/emotions.ts";
import { updateSettings } from "@/db/db.ts";
import type { PrimaryEmotion } from "@/db/types.ts";

export function ColorSettings() {
  const { t } = useTranslation();
  const { emotionColors } = useSettings();

  async function setColor(id: PrimaryEmotion, color: string) {
    await updateSettings({ emotionColors: { ...emotionColors, [id]: color } });
  }

  async function reset() {
    await updateSettings({ emotionColors: {} });
  }

  return (
    <section className="rounded-card border border-border bg-surface-raised p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-sm">{t("settings.colors.title")}</h2>
        <button
          type="button"
          onClick={() => void reset()}
          className="text-text-muted text-xs hover:text-text"
        >
          {t("settings.colors.reset")}
        </button>
      </div>
      <ul className="space-y-2">
        {EMOTIONS.map((meta) => (
          <li key={meta.id} className="flex items-center justify-between">
            <span className="text-sm">
              {meta.emoji} {t(`emotion.${meta.id}`)}
            </span>
            <input
              type="color"
              aria-label={t(`emotion.${meta.id}`)}
              value={emotionColors[meta.id] ?? meta.defaultColor}
              onChange={(e) => void setColor(meta.id, e.target.value)}
              className="h-8 w-12 cursor-pointer rounded border border-border bg-transparent"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
