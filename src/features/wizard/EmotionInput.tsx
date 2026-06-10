import { useTranslation } from "react-i18next";
import { IntensitySlider } from "@/components/IntensitySlider.tsx";
import { EMOTIONS, getEmotionMeta } from "@/data/emotions.ts";
import type { Emotion, PrimaryEmotion } from "@/db/types.ts";

interface Props {
  emotions: Emotion[];
  onAdd: (primary: PrimaryEmotion) => void;
  onUpdate: (index: number, patch: Partial<Emotion>) => void;
  onRemove: (index: number) => void;
}

export function EmotionInput({ emotions, onAdd, onUpdate, onRemove }: Props) {
  const { t } = useTranslation();
  const used = new Set(emotions.map((e) => e.primary));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {EMOTIONS.map((meta) => (
          <button
            key={meta.id}
            type="button"
            disabled={used.has(meta.id)}
            onClick={() => onAdd(meta.id)}
            className="rounded-full border border-border px-3 py-1.5 text-sm transition-opacity disabled:opacity-30"
            style={{ borderColor: used.has(meta.id) ? undefined : `var(${meta.cssVar})` }}
          >
            <span className="mr-1">{meta.emoji}</span>
            {t(`emotion.${meta.id}`)}
          </button>
        ))}
      </div>

      <ul className="space-y-4">
        {emotions.map((emotion, index) => {
          const meta = getEmotionMeta(emotion.primary);
          return (
            <li
              key={emotion.primary}
              className="rounded-card border border-border bg-surface-raised p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-sm">
                  {meta.emoji} {t(`emotion.${emotion.primary}`)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="text-text-muted text-xs hover:text-danger"
                >
                  {t("emotion.remove")}
                </button>
              </div>
              <IntensitySlider
                value={emotion.initialIntensity}
                onChange={(v) => onUpdate(index, { initialIntensity: v })}
                color={`var(${meta.cssVar})`}
                label={t("emotion.intensity")}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
