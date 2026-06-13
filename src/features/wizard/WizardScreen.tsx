import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { AppBar } from "@/components/AppBar.tsx";
import { Button } from "@/components/Button.tsx";
import { DISTORTION_IDS } from "@/data/distortions.ts";
import { createRecord, getRecord, saveRecord } from "@/db/records.ts";
import { WizardStep } from "@/features/wizard/WizardStep.tsx";
import {
  fromRecord,
  hasStepInput,
  initialState,
  isWorthSaving,
  STEP_COUNT,
  STEPS,
  toDraft,
  type WizardState,
  wizardReducer,
} from "@/features/wizard/wizardState.ts";

interface Props {
  mode: "new" | "edit";
}

/** Collapsible recap of an earlier step's answer, closed by default. */
function StepRecap({ title, text }: { title: string; text: string }) {
  return (
    <details className="group mx-4 mt-3 rounded-card border border-border bg-surface-raised">
      <summary className="flex cursor-pointer select-none items-center justify-between p-3 text-text-muted text-xs uppercase tracking-wide [&::-webkit-details-marker]:hidden">
        {title}
        <span
          aria-hidden
          className="flex h-6 w-6 items-center justify-center rounded-full bg-border text-text transition-transform group-open:-rotate-90"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
            <path
              d="M10 4L6 8l4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </summary>
      <p className="whitespace-pre-wrap px-3 pb-3 text-sm leading-relaxed">{text}</p>
    </details>
  );
}

export function WizardScreen({ mode }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const editId = mode === "edit" && params.id ? Number(params.id) : null;

  const [state, dispatch] = useReducer(wizardReducer, undefined, initialState);
  const [loaded, setLoaded] = useState(mode === "new");
  const recordIdRef = useRef<number | null>(editId);

  // Load existing record once when editing.
  useEffect(() => {
    if (mode !== "edit" || editId == null) return;
    let active = true;
    void getRecord(editId).then((record) => {
      if (!active || !record) return;
      const { step, ...draft } = fromRecord(record);
      dispatch({ type: "load", draft, step });
      recordIdRef.current = editId;
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [mode, editId]);

  const persist = useCallback(async (snapshot: WizardState, complete = false) => {
    if (recordIdRef.current == null && !isWorthSaving(snapshot)) return;
    const now = Date.now();
    const draft = toDraft(snapshot);
    if (complete) draft.status = "complete";
    if (recordIdRef.current == null) {
      recordIdRef.current = await createRecord(draft, now);
    } else {
      await saveRecord(recordIdRef.current, draft, now);
    }
  }, []);

  // Debounced auto-save on every change.
  useEffect(() => {
    if (!loaded) return;
    const handle = setTimeout(() => void persist(state), 600);
    return () => clearTimeout(handle);
  }, [state, loaded, persist]);

  const stepKey = STEPS[state.step] ?? STEPS[0];
  const isLast = state.step === STEP_COUNT - 1;
  const stepHasInput = hasStepInput(state, stepKey);
  const showEventRecap =
    (stepKey === "emotions" || stepKey === "automaticThoughts") && state.event.trim().length > 0;
  const showThoughtsRecap =
    (stepKey === "supportingFacts" ||
      stepKey === "contradictingFacts" ||
      stepKey === "distortions" ||
      stepKey === "alternativeThoughts") &&
    state.automaticThoughts.trim().length > 0;
  const showFactsRecaps = stepKey === "distortions" || stepKey === "alternativeThoughts";
  const selectedDistortions = DISTORTION_IDS.filter((id) => state.distortions.includes(id));
  const showDistortionsRecap = stepKey === "alternativeThoughts" && selectedDistortions.length > 0;

  function goTo(step: number) {
    dispatch({ type: "setStep", step });
    window.scrollTo({ top: 0 });
  }

  async function finish() {
    await persist({ ...state, currentStep: state.step }, true);
    navigate(recordIdRef.current != null ? `/record/${recordIdRef.current}` : "/");
  }

  async function leave() {
    await persist(state);
    navigate("/");
  }

  if (!loaded) return <AppBar title={t("wizard.editTitle")} onBack={() => navigate("/")} />;

  return (
    <div className="flex min-h-full flex-col">
      <AppBar
        title={mode === "edit" ? t("wizard.editTitle") : t("wizard.newTitle")}
        onBack={() => void leave()}
      />

      {showEventRecap && <StepRecap title={t("wizard.step.event.title")} text={state.event} />}
      {showThoughtsRecap && (
        <StepRecap
          title={t("wizard.step.automaticThoughts.title")}
          text={state.automaticThoughts}
        />
      )}
      {showFactsRecaps && state.supportingFacts.trim().length > 0 && (
        <StepRecap title={t("wizard.step.supportingFacts.title")} text={state.supportingFacts} />
      )}
      {showFactsRecaps && state.contradictingFacts.trim().length > 0 && (
        <StepRecap
          title={t("wizard.step.contradictingFacts.title")}
          text={state.contradictingFacts}
        />
      )}
      {showDistortionsRecap && (
        <StepRecap
          title={t("wizard.step.distortions.title")}
          text={selectedDistortions.map((id) => t(`distortion.${id}.name`)).join("\n")}
        />
      )}

      <main className="flex-1 p-4 pb-28">
        <WizardStep key={stepKey} stepKey={stepKey} state={state} dispatch={dispatch} />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-10 border-border border-t bg-surface/90 p-3 backdrop-blur">
        <div className="mx-auto max-w-2xl">
          <div
            role="progressbar"
            aria-label={t("wizard.progressLabel")}
            aria-valuenow={state.step + 1}
            aria-valuemin={1}
            aria-valuemax={STEP_COUNT}
            className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-border"
          >
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${((state.step + 1) / STEP_COUNT) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-1 justify-start">
              <Button
                variant="ghost"
                disabled={state.step === 0}
                onClick={() => goTo(state.step - 1)}
              >
                {t("common.previous")}
              </Button>
            </div>
            <span className="flex flex-col items-center text-center text-text-muted text-xs leading-tight">
              <span>{t("wizard.progressLabel")}</span>
              <span>{t("wizard.progressCount", { current: state.step + 1, total: STEP_COUNT })}</span>
            </span>
            <div className="flex flex-1 justify-end">
              {isLast ? (
                <Button onClick={() => void finish()}>{t("common.finish")}</Button>
              ) : (
                <Button
                  variant={stepHasInput ? "primary" : "soft"}
                  onClick={() => goTo(state.step + 1)}
                >
                  {t(stepHasInput ? "common.next" : "common.skip")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
