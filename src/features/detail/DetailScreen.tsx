import { useLiveQuery } from "dexie-react-hooks";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { AppBar } from "@/components/AppBar.tsx";
import { Button } from "@/components/Button.tsx";
import { ConfirmDialog } from "@/components/ConfirmDialog.tsx";
import type { DistortionId } from "@/data/distortions.ts";
import { getEmotionMeta } from "@/data/emotions.ts";
import { deleteRecord, getRecord } from "@/db/records.ts";
import type { ThoughtRecord } from "@/db/types.ts";
import { ExportDialog } from "@/features/export/ExportDialog.tsx";
import { formatEventDate } from "@/lib/format.ts";

export function DetailScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const record = useLiveQuery(() => (id != null ? getRecord(id) : undefined), [id]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showExport, setShowExport] = useState(false);

  if (record === undefined) return <AppBar title="" back="/" />;
  if (record === null || id == null) {
    return <AppBar title={t("detail.empty")} back="/" />;
  }

  async function remove() {
    if (id != null) await deleteRecord(id);
    navigate("/");
  }

  return (
    <div className="min-h-full pb-8">
      <AppBar
        title={formatEventDate(record.eventDate, record.eventTime) || t("detail.sections.event")}
        back="/"
        right={
          <button
            type="button"
            aria-label={t("common.export")}
            onClick={() => setShowExport(true)}
            className="rounded-control px-2 py-1 text-text-muted text-lg hover:text-text"
          >
            ⤴
          </button>
        }
      />

      <main className="space-y-5 p-4">
        <Section title={t("detail.sections.event")}>
          <Text value={record.event} />
        </Section>

        <Section title={t("detail.sections.emotions")}>
          <EmotionList record={record} kind="initial" />
        </Section>

        <Section title={t("detail.sections.automaticThoughts")}>
          <Text value={record.automaticThoughts} />
        </Section>

        <Section title={t("detail.sections.supportingFacts")}>
          <Text value={record.supportingFacts} />
        </Section>

        <Section title={t("detail.sections.contradictingFacts")}>
          <Text value={record.contradictingFacts} />
        </Section>

        <Section title={t("detail.sections.alternativeThoughts")}>
          <Text value={record.alternativeThoughts} />
          <DistortionTags ids={record.distortions} />
        </Section>

        <Section title={t("detail.sections.result")}>
          <EmotionList record={record} kind="result" />
        </Section>

        <div className="flex gap-2 pt-2">
          <Button variant="soft" onClick={() => navigate(`/record/${id}/edit`)}>
            {t("common.edit")}
          </Button>
          <div className="flex-1" />
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            {t("common.delete")}
          </Button>
        </div>
      </main>

      <ConfirmDialog
        open={confirmDelete}
        message={t("detail.deleteConfirm")}
        confirmLabel={t("common.delete")}
        danger
        onConfirm={() => void remove()}
        onCancel={() => setConfirmDelete(false)}
      />
      {showExport && (
        <ExportDialog scope="single" record={record} onClose={() => setShowExport(false)} />
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-card border border-border bg-surface-raised p-4">
      <h2 className="mb-2 font-semibold text-primary text-sm">{title}</h2>
      {children}
    </section>
  );
}

function Text({ value }: { value: string }) {
  const { t } = useTranslation();
  if (!value.trim()) return <p className="text-sm text-text-muted italic">{t("detail.empty")}</p>;
  return <p className="whitespace-pre-wrap text-sm leading-relaxed">{value}</p>;
}

function EmotionList({ record, kind }: { record: ThoughtRecord; kind: "initial" | "result" }) {
  const { t } = useTranslation();
  if (record.emotions.length === 0) {
    return <p className="text-sm text-text-muted italic">{t("detail.empty")}</p>;
  }
  return (
    <ul className="space-y-1.5">
      {record.emotions.map((emotion) => {
        const meta = getEmotionMeta(emotion.primary);
        const value =
          kind === "initial" ? emotion.initialIntensity : emotion.resultIntensity;
        return (
          <li key={emotion.primary} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: `var(${meta.cssVar})` }}
              />
              {meta.emoji} {t(`emotion.${emotion.primary}`)}
            </span>
            <span className="text-text-muted tabular-nums">
              {value != null ? `${value}/10` : t("detail.empty")}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function DistortionTags({ ids }: { ids: string[] }) {
  const { t } = useTranslation();
  if (ids.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <span key={id} className="rounded-full bg-accent-soft px-2 py-0.5 text-text-muted text-xs">
          {t(`distortion.${id as DistortionId}.name`)}
        </span>
      ))}
    </div>
  );
}
