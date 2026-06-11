import type { RecordDraft } from "@/db/records.ts";
import { emptyDraft } from "@/db/records.ts";
import type { Emotion, PrimaryEmotion, ThoughtRecord } from "@/db/types.ts";

export const STEP_COUNT = 8;

/** i18n key suffix + which draft field a step edits, in order. */
export const STEPS = [
  "event",
  "emotions",
  "automaticThoughts",
  "supportingFacts",
  "contradictingFacts",
  "distortions",
  "alternativeThoughts",
  "result",
] as const;

export type StepKey = (typeof STEPS)[number];

/** Steps the user is allowed to skip (optional columns). */
export const SKIPPABLE: ReadonlySet<StepKey> = new Set<StepKey>([
  "supportingFacts",
  "contradictingFacts",
  "distortions",
  "alternativeThoughts",
]);

export type WizardState = RecordDraft & { step: number };

export type WizardAction =
  | { type: "load"; draft: RecordDraft; step: number }
  | { type: "setField"; field: keyof RecordDraft; value: string }
  | { type: "setStep"; step: number }
  | { type: "setEmotionIntensity"; primary: PrimaryEmotion; intensity: number }
  | { type: "updateEmotion"; index: number; patch: Partial<Emotion> }
  | { type: "toggleDistortion"; id: string };

export function initialState(): WizardState {
  return { ...emptyDraft(), step: 0 };
}

export function fromRecord(record: ThoughtRecord): WizardState {
  const { id: _id, createdAt: _c, updatedAt: _u, ...draft } = record;
  return { ...draft, step: record.currentStep ?? 0 };
}

export function toDraft(state: WizardState): RecordDraft {
  const { step, ...draft } = state;
  return { ...draft, currentStep: step };
}

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "load":
      return { ...action.draft, step: action.step };
    case "setField":
      return { ...state, [action.field]: action.value };
    case "setStep":
      return { ...state, step: action.step };
    case "setEmotionIntensity": {
      if (action.intensity <= 0) {
        return {
          ...state,
          emotions: state.emotions.filter((e) => e.primary !== action.primary),
        };
      }
      const exists = state.emotions.some((e) => e.primary === action.primary);
      return {
        ...state,
        emotions: exists
          ? state.emotions.map((e) =>
              e.primary === action.primary ? { ...e, initialIntensity: action.intensity } : e,
            )
          : [...state.emotions, { primary: action.primary, initialIntensity: action.intensity }],
      };
    }
    case "updateEmotion":
      return {
        ...state,
        emotions: state.emotions.map((e, i) =>
          i === action.index ? { ...e, ...action.patch } : e,
        ),
      };
    case "toggleDistortion": {
      const has = state.distortions.includes(action.id);
      return {
        ...state,
        distortions: has
          ? state.distortions.filter((d) => d !== action.id)
          : [...state.distortions, action.id],
      };
    }
  }
}

/** True once the draft holds enough to be worth persisting (avoids empty records). */
export function isWorthSaving(state: WizardState): boolean {
  return (
    state.event.trim().length > 0 ||
    state.emotions.length > 0 ||
    state.automaticThoughts.trim().length > 0
  );
}
