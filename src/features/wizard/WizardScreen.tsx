import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { AppBar } from "@/components/AppBar.tsx";
import { Button } from "@/components/Button.tsx";
import { createRecord, getRecord, saveRecord } from "@/db/records.ts";
import { WizardStep } from "@/features/wizard/WizardStep.tsx";
import {
  fromRecord,
  initialState,
  isWorthSaving,
  SKIPPABLE,
  STEP_COUNT,
  STEPS,
  toDraft,
  type WizardState,
  wizardReducer,
} from "@/features/wizard/wizardState.ts";

interface Props {
  mode: "new" | "edit";
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
  const canSkip = SKIPPABLE.has(stepKey);
  const showEventRecap =
    (stepKey === "emotions" || stepKey === "automaticThoughts") && state.event.trim().length > 0;

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

      <div className="px-4 pt-3">
        <div className="mb-1 flex items-center justify-between text-text-muted text-xs">
          <span>{t("wizard.progress", { current: state.step + 1, total: STEP_COUNT })}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((state.step + 1) / STEP_COUNT) * 100}%` }}
          />
        </div>
      </div>

      {showEventRecap && (
        <div className="mx-4 mt-3 rounded-card border border-border bg-surface-raised p-3">
          <p className="text-text-muted text-xs uppercase tracking-wide">
            {t("wizard.step.event.title")}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{state.event}</p>
        </div>
      )}

      <main className="flex-1 p-4">
        <WizardStep stepKey={stepKey} state={state} dispatch={dispatch} />
      </main>

      <footer className="sticky bottom-0 flex items-center gap-2 border-border border-t bg-surface/90 p-3 backdrop-blur">
        <Button variant="ghost" disabled={state.step === 0} onClick={() => goTo(state.step - 1)}>
          {t("common.previous")}
        </Button>
        <div className="flex-1" />
        {canSkip && !isLast && (
          <Button variant="soft" onClick={() => goTo(state.step + 1)}>
            {t("common.skip")}
          </Button>
        )}
        {isLast ? (
          <Button onClick={() => void finish()}>{t("common.finish")}</Button>
        ) : (
          <Button onClick={() => goTo(state.step + 1)}>{t("common.next")}</Button>
        )}
      </footer>
    </div>
  );
}
