import { type Dispatch, useState } from "react";
import { useTranslation } from "react-i18next";
import { HintToggleIcon } from "@/components/HintToggleIcon.tsx";
import { IntensitySlider } from "@/components/IntensitySlider.tsx";
import { TextArea } from "@/components/TextArea.tsx";
import { EMOTIONS, getEmotionMeta } from "@/data/emotions.ts";
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
        <div className="flex items-center gap-2">
          <h2 id="wizard-step-heading" className="font-semibold text-lg">{t(`wizard.step.${stepKey}.title`)}</h2>
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

      <div className="space-y-2">
        <p className="text-primary text-xs uppercase tracking-wide">
          {t(`wizard.step.${stepKey}.subtitle`)}
        </p>
        <StepFields stepKey={stepKey} state={state} dispatch={dispatch} />
      </div>
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
            aria-labelledby="wizard-step-heading"
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
          aria-labelledby="wizard-step-heading"
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
          aria-labelledby="wizard-step-heading"
          value={state.alternativeThoughts}
          placeholder={t("wizard.step.alternativeThoughts.placeholder")}
          onChange={(e) =>
            dispatch({ type: "setField", field: "alternativeThoughts", value: e.target.value })
          }
        />
      );

    case "result": {
      const resultMap = new Map(state.emotions.map((e) => [e.primary, e.resultIntensity ?? 0]));
      return (
        <ul className="grid grid-cols-[1fr_2fr_1fr] items-center gap-x-3 gap-y-4">
          {EMOTIONS.map((meta) => {
            const intensity = resultMap.get(meta.id) ?? 0;
            return (
              <li key={meta.id} className="col-span-3 grid grid-cols-subgrid items-center">
                <span
                  className={`justify-self-start whitespace-nowrap rounded-full border px-3 py-1.5 text-sm ${
                    intensity > 0 ? "" : "border-border opacity-50"
                  }`}
                  style={intensity > 0 ? { borderColor: `var(${meta.cssVar})` } : undefined}
                >
                  <span className="mr-1">{meta.emoji}</span>
                  {t(`emotion.${meta.id}`)}
                </span>
                <IntensitySlider
                  min={0}
                  showValue={false}
                  value={intensity}
                  onChange={(v) =>
                    dispatch({ type: "setResultIntensity", primary: meta.id, intensity: v })
                  }
                  color={`var(${meta.cssVar})`}
                  ariaLabel={t(`emotion.${meta.id}`)}
                />
                <span
                  className={`text-center font-semibold text-sm tabular-nums ${
                    intensity > 0 ? "text-text" : "text-text-muted"
                  }`}
                >
                  {intensity > 0 ? `${intensity}/10` : "–"}
                </span>
              </li>
            );
          })}
        </ul>
      );
    }
  }
}
