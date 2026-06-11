import { type Dispatch, useState } from "react";
import { useTranslation } from "react-i18next";
import { HintToggleIcon } from "@/components/HintToggleIcon.tsx";
import { IntensitySlider } from "@/components/IntensitySlider.tsx";
import { TextArea } from "@/components/TextArea.tsx";
import { getEmotionMeta } from "@/data/emotions.ts";
import { DistortionPicker } from "@/features/wizard/DistortionPicker.tsx";
import { EmotionInput } from "@/features/wizard/EmotionInput.tsx";
import type { StepKey, WizardAction, WizardState } from "@/features/wizard/wizardState.ts";

interface Props {
  stepKey: StepKey;
  state: WizardState;
  dispatch: Dispatch<WizardAction>;
}

export function WizardStep({ stepKey, state, dispatch }: Props) {
  const { t } = useTranslation();
  const [hintOpen, setHintOpen] = useState(false);

  return (
    <section className="space-y-4">
      <header>
        <p className="text-primary text-xs uppercase tracking-wide">
          {t(`wizard.step.${stepKey}.subtitle`)}
        </p>
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-lg">{t(`wizard.step.${stepKey}.title`)}</h2>
          <button
            type="button"
            aria-expanded={hintOpen}
            aria-label={t(hintOpen ? "wizard.hint.hide" : "wizard.hint.show")}
            onClick={() => setHintOpen((open) => !open)}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-border text-text"
          >
            <HintToggleIcon open={hintOpen} />
          </button>
        </div>
        {hintOpen && (
          <p className="mt-1 text-sm text-text-muted leading-relaxed">
            {t(`wizard.step.${stepKey}.hint`)}
          </p>
        )}
      </header>

      <StepFields stepKey={stepKey} state={state} dispatch={dispatch} />
    </section>
  );
}

function StepFields({ stepKey, state, dispatch }: Props) {
  const { t } = useTranslation();

  switch (stepKey) {
    case "event":
      return (
        <div className="space-y-3">
          <TextArea
            value={state.event}
            placeholder={t("wizard.step.event.placeholder")}
            onChange={(e) => dispatch({ type: "setField", field: "event", value: e.target.value })}
          />
          <div className="flex gap-3">
            <label className="flex-1 text-text-muted text-xs">
              {t("wizard.step.event.dateLabel")}
              <input
                type="date"
                value={state.eventDate ?? ""}
                onChange={(e) =>
                  dispatch({ type: "setField", field: "eventDate", value: e.target.value })
                }
                className="mt-1 w-full rounded-control border border-border bg-surface-raised p-2 text-sm text-text"
              />
            </label>
            <label className="flex-1 text-text-muted text-xs">
              {t("wizard.step.event.timeLabel")}
              <input
                type="time"
                value={state.eventTime ?? ""}
                onChange={(e) =>
                  dispatch({ type: "setField", field: "eventTime", value: e.target.value })
                }
                className="mt-1 w-full rounded-control border border-border bg-surface-raised p-2 text-sm text-text"
              />
            </label>
          </div>
        </div>
      );

    case "emotions":
      return (
        <EmotionInput
          emotions={state.emotions}
          onSetIntensity={(primary, intensity) =>
            dispatch({ type: "setEmotionIntensity", primary, intensity })
          }
        />
      );

    case "automaticThoughts":
    case "supportingFacts":
    case "contradictingFacts":
      return (
        <TextArea
          value={state[stepKey]}
          placeholder={t(`wizard.step.${stepKey}.placeholder`)}
          onChange={(e) => dispatch({ type: "setField", field: stepKey, value: e.target.value })}
        />
      );

    case "distortions":
      return (
        <DistortionPicker
          selected={state.distortions}
          onToggle={(id) => dispatch({ type: "toggleDistortion", id })}
        />
      );

    case "alternativeThoughts":
      return (
        <TextArea
          value={state.alternativeThoughts}
          placeholder={t("wizard.step.alternativeThoughts.placeholder")}
          onChange={(e) =>
            dispatch({ type: "setField", field: "alternativeThoughts", value: e.target.value })
          }
        />
      );

    case "result":
      if (state.emotions.length === 0) {
        return <p className="text-sm text-text-muted">{t("wizard.step.result.noEmotions")}</p>;
      }
      return (
        <ul className="space-y-4">
          {state.emotions.map((emotion, index) => {
            const meta = getEmotionMeta(emotion.primary);
            return (
              <li
                key={emotion.primary}
                className="rounded-card border border-border bg-surface-raised p-3"
              >
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {meta.emoji} {t(`emotion.${emotion.primary}`)}
                  </span>
                  <span className="text-text-muted">
                    {t("wizard.step.result.before")} : {emotion.initialIntensity}/10
                  </span>
                </div>
                <IntensitySlider
                  value={emotion.resultIntensity ?? emotion.initialIntensity}
                  onChange={(v) =>
                    dispatch({ type: "updateEmotion", index, patch: { resultIntensity: v } })
                  }
                  color={`var(${meta.cssVar})`}
                  label={t("wizard.step.result.now")}
                />
              </li>
            );
          })}
        </ul>
      );
  }
}
