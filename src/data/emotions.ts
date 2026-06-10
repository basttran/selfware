import type { PrimaryEmotion } from "@/db/types.ts";

export interface EmotionMeta {
  id: PrimaryEmotion;
  emoji: string;
  /** Default CSS variable holding the color (overridable via Settings.emotionColors). */
  cssVar: `--color-emotion-${PrimaryEmotion}`;
  /** Fallback default color, mirrors the value in index.css. */
  defaultColor: string;
}

/** Ekman's six primaries. Labels are resolved via i18n (`emotion.<id>`). */
export const EMOTIONS: readonly EmotionMeta[] = [
  { id: "sadness", emoji: "😢", cssVar: "--color-emotion-sadness", defaultColor: "#6b8cc7" },
  { id: "anger", emoji: "😠", cssVar: "--color-emotion-anger", defaultColor: "#c77b6b" },
  { id: "fear", emoji: "😨", cssVar: "--color-emotion-fear", defaultColor: "#8a7bbf" },
  { id: "disgust", emoji: "🤢", cssVar: "--color-emotion-disgust", defaultColor: "#7ba36b" },
  { id: "joy", emoji: "😀", cssVar: "--color-emotion-joy", defaultColor: "#d8b25e" },
  { id: "surprise", emoji: "😲", cssVar: "--color-emotion-surprise", defaultColor: "#5ea7b0" },
] as const;

const EMOTION_BY_ID = new Map(EMOTIONS.map((e) => [e.id, e]));

export function getEmotionMeta(id: PrimaryEmotion): EmotionMeta {
  const meta = EMOTION_BY_ID.get(id);
  if (!meta) throw new Error(`Émotion inconnue: ${id}`);
  return meta;
}
