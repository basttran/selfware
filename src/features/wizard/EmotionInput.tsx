import { useTranslation } from "react-i18next";
import { IntensitySlider } from "@/components/IntensitySlider.tsx";
import { EMOTIONS } from "@/data/emotions.ts";
import type { Emotion, PrimaryEmotion } from "@/db/types.ts";

interface Props {
  emotions: Emotion[];
  onSetIntensity: (primary: PrimaryEmotion, intensity: number) => void;
}

/** Pills stacked in a column on the left, each labelling its slider; 0 means "not felt". */
export function EmotionInput({ emotions, onSetIntensity }: Props) {
  const { t } = useTranslation();
  const intensityByPrimary = new Map(emotions.map((e) => [e.primary, e.initialIntensity]));

  return (
    <ul className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-4">
      {EMOTIONS.map((meta) => {
        const intensity = intensityByPrimary.get(meta.id) ?? 0;
        return (
          <li key={meta.id} className="col-span-2 grid grid-cols-subgrid items-center">
            <span
              className={`justify-self-start rounded-full border px-3 py-1.5 text-sm ${
                intensity > 0 ? "" : "border-border opacity-50"
              }`}
              style={intensity > 0 ? { borderColor: `var(${meta.cssVar})` } : undefined}
            >
              <span className="mr-1">{meta.emoji}</span>
              {t(`emotion.${meta.id}`)}
            </span>
            <IntensitySlider
              min={0}
              value={intensity}
              onChange={(v) => onSetIntensity(meta.id, v)}
              color={`var(${meta.cssVar})`}
            />
          </li>
        );
      })}
    </ul>
  );
}
