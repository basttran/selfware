import { useTranslation } from "react-i18next";
import { getEmotionMeta } from "@/data/emotions.ts";
import type { Emotion } from "@/db/types.ts";

/** Small colored dots + labels summarizing a record's emotions. */
export function EmotionChips({ emotions }: { emotions: Emotion[] }) {
  const { t } = useTranslation();
  if (emotions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {emotions.map((emotion) => {
        const meta = getEmotionMeta(emotion.primary);
        return (
          <span
            key={emotion.primary}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
            style={{
              backgroundColor: `color-mix(in srgb, var(${meta.cssVar}) 18%, transparent)`,
              color: `var(${meta.cssVar})`,
            }}
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: `var(${meta.cssVar})` }}
            />
            {t(`emotion.${emotion.primary}`)} {emotion.initialIntensity}
          </span>
        );
      })}
    </div>
  );
}
