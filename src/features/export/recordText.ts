import i18n from "i18next";
import type { DistortionId } from "@/data/distortions.ts";
import type { Emotion, ThoughtRecord } from "@/db/types.ts";
import { formatEventDate } from "@/lib/format.ts";

/** Plain-text helpers shared by the PDF layouts (no JSX, no emoji). */

export function emotionLabel(emotion: Emotion): string {
  const name = i18n.t(`emotion.${emotion.primary}`);
  const after = emotion.resultIntensity != null ? ` → ${emotion.resultIntensity}` : "";
  return `${name} ${emotion.initialIntensity}/10${after}`;
}

export function emotionsText(emotions: Emotion[]): string {
  return emotions.map(emotionLabel).join("\n") || "—";
}

export function distortionsText(ids: string[]): string {
  return ids.map((id) => i18n.t(`distortion.${id as DistortionId}.name`)).join(", ");
}

export function recordWhen(record: ThoughtRecord): string {
  return formatEventDate(record.eventDate, record.eventTime) || "";
}

export function orDash(value: string): string {
  return value.trim() || "—";
}
