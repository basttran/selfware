import { Document, Font, Page, pdf, StyleSheet, Text, View } from "@react-pdf/renderer";

Font.registerEmojiSource({
  format: "png",
  url: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/",
});
import i18n from "i18next";
import { EMOTIONS } from "@/data/emotions.ts";
import type { Emotion, ThoughtRecord } from "@/db/types.ts";
import { distortionsText, orDash, recordWhen } from "@/features/export/recordText.ts";

export type ExportLayout = "card" | "table";

const COLORS = {
  text: "#1f2933",
  muted: "#5b6776",
  primary: "#3f7d80",
  border: "#d7dde4",
};

// ── helpers ──────────────────────────────────────────────────────────────────

function emotionScores(
  emotions: Emotion[],
  kind: "initial" | "result",
): { label: string; score: string }[] {
  const map = new Map(
    emotions.map((e) => [
      e.primary,
      kind === "initial" ? e.initialIntensity : (e.resultIntensity ?? null),
    ]),
  );
  return EMOTIONS.map((meta) => {
    const score = map.get(meta.id);
    return {
      label: `${meta.emoji} ${i18n.t(`emotion.${meta.id}`)}`,
      score: score != null ? `${score}/10` : "—",
    };
  });
}

// ── card styles ───────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: { padding: 20, fontSize: 9, color: COLORS.text, fontFamily: "Helvetica" },
  title: { fontSize: 13, color: COLORS.primary, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  when: { fontSize: 8, color: COLORS.muted, marginBottom: 10 },

  row: { flexDirection: "row", gap: 8, marginBottom: 8 },

  block: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 6,
  },
  blockFull: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 6,
    marginBottom: 8,
  },
  blockLabel: {
    fontSize: 7,
    color: COLORS.primary,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  blockValue: { lineHeight: 1.4 },

  // emotion grid: 2 columns of 3
  emotionGrid: { flexDirection: "row", gap: 12 },
  emotionCol: { flex: 1 },
  emotionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  emotionName: { fontSize: 8 },
  emotionScore: { fontSize: 8, color: COLORS.muted },
});

// ── sub-components ────────────────────────────────────────────────────────────

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.block}>
      <Text style={s.blockLabel}>{label}</Text>
      {children}
    </View>
  );
}

function BlockFull({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.blockFull}>
      <Text style={s.blockLabel}>{label}</Text>
      {children}
    </View>
  );
}

function EmotionGridBlock({
  label,
  emotions,
  kind,
}: {
  label: string;
  emotions: Emotion[];
  kind: "initial" | "result";
}) {
  const scores = emotionScores(emotions, kind);
  const left = scores.slice(0, 3);
  const right = scores.slice(3);
  return (
    <BlockFull label={label}>
      <View style={s.emotionGrid}>
        <View style={s.emotionCol}>
          {left.map((e) => (
            <View key={e.label} style={s.emotionItem}>
              <Text style={s.emotionName}>{e.label}</Text>
              <Text style={s.emotionScore}>{e.score}</Text>
            </View>
          ))}
        </View>
        <View style={s.emotionCol}>
          {right.map((e) => (
            <View key={e.label} style={s.emotionItem}>
              <Text style={s.emotionName}>{e.label}</Text>
              <Text style={s.emotionScore}>{e.score}</Text>
            </View>
          ))}
        </View>
      </View>
    </BlockFull>
  );
}

// ── card document ─────────────────────────────────────────────────────────────

function CardDoc({ records }: { records: ThoughtRecord[] }) {
  const tr = i18n.t;
  return (
    <Document title={tr("app.name")}>
      {records.map((record) => (
        <Page key={record.id} size="A5" style={s.page}>
          <Text style={s.title}>{tr("app.name")}</Text>
          <Text style={s.when}>{recordWhen(record)}</Text>

          {/* Section 1 — Événement | Pensées automatiques */}
          <View style={s.row}>
            <Block label={tr("detail.sections.event")}>
              <Text style={s.blockValue}>{orDash(record.event)}</Text>
            </Block>
            <Block label={tr("detail.sections.automaticThoughts")}>
              <Text style={s.blockValue}>{orDash(record.automaticThoughts)}</Text>
            </Block>
          </View>

          {/* Section 2 — Émotions étape 2 */}
          <EmotionGridBlock
            label={tr("detail.sections.emotions")}
            emotions={record.emotions}
            kind="initial"
          />

          {/* Section 3 — Faits qui soutiennent | Faits qui contredisent */}
          <View style={s.row}>
            <Block label={tr("detail.sections.supportingFacts")}>
              <Text style={s.blockValue}>{orDash(record.supportingFacts)}</Text>
            </Block>
            <Block label={tr("detail.sections.contradictingFacts")}>
              <Text style={s.blockValue}>{orDash(record.contradictingFacts)}</Text>
            </Block>
          </View>

          {/* Section 4 — Distorsions | Pensées alternatives */}
          <View style={s.row}>
            <Block label={tr("detail.sections.distortions")}>
              <Text style={s.blockValue}>{orDash(distortionsText(record.distortions))}</Text>
            </Block>
            <Block label={tr("detail.sections.alternativeThoughts")}>
              <Text style={s.blockValue}>{orDash(record.alternativeThoughts)}</Text>
            </Block>
          </View>

          {/* Section 5 — Émotions étape résultat */}
          <EmotionGridBlock
            label={tr("detail.sections.result")}
            emotions={record.emotions}
            kind="result"
          />
        </Page>
      ))}
    </Document>
  );
}

// ── table document (unchanged) ────────────────────────────────────────────────

function sectionsOf(record: ThoughtRecord): { label: string; value: string }[] {
  const tr = i18n.t;
  return [
    { label: tr("detail.sections.event"), value: orDash(record.event) },
    { label: tr("detail.sections.emotions"), value: emotionsText(record.emotions) },
    { label: tr("detail.sections.automaticThoughts"), value: orDash(record.automaticThoughts) },
    { label: tr("detail.sections.supportingFacts"), value: orDash(record.supportingFacts) },
    { label: tr("detail.sections.contradictingFacts"), value: orDash(record.contradictingFacts) },
    { label: tr("detail.sections.distortions"), value: orDash(distortionsText(record.distortions)) },
    {
      label: tr("detail.sections.alternativeThoughts"),
      value: orDash(record.alternativeThoughts),
    },
    { label: tr("detail.sections.result"), value: emotionsText(record.emotions) },
  ];
}

function emotionsText(emotions: Emotion[]): string {
  const map = new Map(emotions.map((e) => [e.primary, e]));
  return EMOTIONS.map((meta) => {
    const e = map.get(meta.id);
    const name = `${meta.emoji} ${i18n.t(`emotion.${meta.id}`)}`;
    if (!e) return `${name} —`;
    const after = e.resultIntensity != null ? ` → ${e.resultIntensity}` : "";
    return `${name} ${e.initialIntensity}/10${after}`;
  }).join("\n");
}

const tableStyles = StyleSheet.create({
  page: { padding: 20, fontSize: 8, color: COLORS.text, fontFamily: "Helvetica" },
  headerRow: { flexDirection: "row", borderBottom: `2px solid ${COLORS.border}`, marginBottom: 4 },
  headerCell: {
    flex: 1,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderRight: `1px solid ${COLORS.border}`,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: { flexDirection: "row", borderBottom: `1px solid ${COLORS.border}` },
  cell: { flex: 1, padding: 5, borderRight: `1px solid ${COLORS.border}` },
  value: { lineHeight: 1.3 },
});

function TableDoc({ records }: { records: ThoughtRecord[] }) {
  const headers = sectionsOf(records[0] ?? ({} as ThoughtRecord)).map((s) => s.label);
  return (
    <Document title={i18n.t("app.name")}>
      <Page size="A4" orientation="landscape" style={tableStyles.page}>
        <View style={tableStyles.headerRow}>
          {headers.map((h) => (
            <Text key={h} style={tableStyles.headerCell}>
              {h}
            </Text>
          ))}
        </View>
        {records.map((record) => (
          <View key={record.id} style={tableStyles.row} wrap={false}>
            {sectionsOf(record).map((sec) => (
              <Text key={sec.label} style={{ ...tableStyles.cell, ...tableStyles.value }}>
                {sec.value}
              </Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

// ── entry point ───────────────────────────────────────────────────────────────

export async function buildPdfBlob(layout: ExportLayout, records: ThoughtRecord[]): Promise<Blob> {
  const doc = layout === "card" ? <CardDoc records={records} /> : <TableDoc records={records} />;
  return pdf(doc).toBlob();
}
