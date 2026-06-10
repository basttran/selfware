import { EMOTIONS } from "@/data/emotions.ts";
import type { PrimaryEmotion } from "@/db/types.ts";

/**
 * Apply per-emotion color overrides by setting the corresponding CSS custom
 * properties on :root. Missing keys fall back to the defaults from index.css.
 */
export function applyEmotionColors(overrides: Partial<Record<PrimaryEmotion, string>>): void {
  const root = document.documentElement;
  for (const emotion of EMOTIONS) {
    const value = overrides[emotion.id];
    if (value) root.style.setProperty(emotion.cssVar, value);
    else root.style.removeProperty(emotion.cssVar);
  }
}

/** Resolve the effective color for an emotion (override or default). */
export function emotionColor(
  id: PrimaryEmotion,
  overrides: Partial<Record<PrimaryEmotion, string>>,
): string {
  const meta = EMOTIONS.find((e) => e.id === id);
  return overrides[id] ?? meta?.defaultColor ?? "#888";
}
