import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/Button.tsx";
import { recordsInRange } from "@/db/records.ts";
import type { ThoughtRecord } from "@/db/types.ts";
import type { ExportLayout } from "@/features/export/pdf.tsx";
import { sharePdf } from "@/features/export/share.ts";

type Scope = "single" | "range";

interface Props {
  /** Provided when exporting from a record's detail; enables the "single" scope. */
  record?: ThoughtRecord;
  scope?: Scope;
  onClose: () => void;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function ExportDialog({ record, scope: initialScope, onClose }: Props) {
  const { t } = useTranslation();
  const [layout, setLayout] = useState<ExportLayout>("card");
  const [scope, setScope] = useState<Scope>(initialScope ?? (record ? "single" : "range"));
  const [from, setFrom] = useState(isoDaysAgo(14));
  const [to, setTo] = useState(isoDaysAgo(0));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const records = scope === "single" && record ? [record] : await recordsInRange(from, to);
      if (records.length === 0) {
        setError(t("export.noneInRange"));
        return;
      }
      const { buildPdfBlob } = await import("@/features/export/pdf.tsx");
      const blob = await buildPdfBlob(layout, records);
      await sharePdf(blob, `${t("export.fileName")}-${to}.pdf`);
      onClose();
    } catch {
      setError(t("export.noneInRange"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-card bg-surface-raised p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="mb-4 font-semibold text-lg">{t("export.title")}</h2>

        <Fieldset legend={t("export.layout")}>
          <Choice
            checked={layout === "card"}
            onSelect={() => setLayout("card")}
            title={t("export.layoutCard")}
            hint={t("export.layoutCardHint")}
          />
          <Choice
            checked={layout === "table"}
            onSelect={() => setLayout("table")}
            title={t("export.layoutTable")}
            hint={t("export.layoutTableHint")}
          />
        </Fieldset>

        <Fieldset legend={t("export.scope")}>
          {record && (
            <Choice
              checked={scope === "single"}
              onSelect={() => setScope("single")}
              title={t("export.scopeSingle")}
            />
          )}
          <Choice
            checked={scope === "range"}
            onSelect={() => setScope("range")}
            title={t("export.scopeRange")}
          />
          {scope === "range" && (
            <div className="mt-2 flex gap-3 pl-6">
              <label className="flex-1 text-text-muted text-xs">
                {t("export.from")}
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="mt-1 w-full rounded-control border border-border bg-surface p-2 text-sm text-text"
                />
              </label>
              <label className="flex-1 text-text-muted text-xs">
                {t("export.to")}
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="mt-1 w-full rounded-control border border-border bg-surface p-2 text-sm text-text"
                />
              </label>
            </div>
          )}
        </Fieldset>

        {error && <p className="mt-2 text-danger text-sm">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={() => void generate()} disabled={busy}>
            {busy ? t("export.generating") : t("export.generate")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="mb-4">
      <legend className="mb-2 font-medium text-sm">{legend}</legend>
      <div className="space-y-2">{children}</div>
    </fieldset>
  );
}

function Choice({
  checked,
  onSelect,
  title,
  hint,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-2 rounded-control border p-3 text-left ${
        checked ? "border-primary bg-accent-soft" : "border-border"
      }`}
    >
      <span
        className={`mt-0.5 size-4 shrink-0 rounded-full border-2 ${
          checked ? "border-primary bg-primary" : "border-border"
        }`}
      />
      <span>
        <span className="block text-sm">{title}</span>
        {hint && <span className="block text-text-muted text-xs">{hint}</span>}
      </span>
    </button>
  );
}
