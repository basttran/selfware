import { Document, Page, pdf, StyleSheet, Text, View } from "@react-pdf/renderer";
import i18n from "i18next";
import type { ThoughtRecord } from "@/db/types.ts";
import {
  distortionsText,
  emotionsText,
  orDash,
  recordWhen,
} from "@/features/export/recordText.ts";

export type ExportLayout = "card" | "table";

const COLORS = {
  text: "#1f2933",
  muted: "#5b6776",
  primary: "#3f7d80",
  border: "#d7dde4",
};

function sectionsOf(record: ThoughtRecord): { label: string; value: string }[] {
  const tr = i18n.t;
  return [
    { label: tr("detail.sections.event"), value: orDash(record.event) },
    { label: tr("detail.sections.emotions"), value: emotionsText(record.emotions) },
    { label: tr("detail.sections.automaticThoughts"), value: orDash(record.automaticThoughts) },
    { label: tr("detail.sections.supportingFacts"), value: orDash(record.supportingFacts) },
    { label: tr("detail.sections.contradictingFacts"), value: orDash(record.contradictingFacts) },
    {
      label: tr("detail.sections.alternativeThoughts"),
      value: orDash(
        [record.alternativeThoughts, distortionsText(record.distortions)]
          .filter((s) => s.trim())
          .join("\n\n"),
      ),
    },
    { label: tr("detail.sections.result"), value: emotionsText(record.emotions) },
  ];
}

const cardStyles = StyleSheet.create({
  page: { padding: 28, fontSize: 10, color: COLORS.text, fontFamily: "Helvetica" },
  title: { fontSize: 14, color: COLORS.primary, fontFamily: "Helvetica-Bold" },
  when: { fontSize: 9, color: COLORS.muted, marginBottom: 12 },
  section: { marginBottom: 10 },
  label: {
    fontSize: 8,
    color: COLORS.primary,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: { lineHeight: 1.4 },
});

/** Fiche layout — A5 portrait, one record per page. */
function CardDoc({ records }: { records: ThoughtRecord[] }) {
  return (
    <Document title={i18n.t("app.name")}>
      {records.map((record) => (
        <Page key={record.id} size="A5" style={cardStyles.page}>
          <Text style={cardStyles.title}>{i18n.t("app.name")}</Text>
          <Text style={cardStyles.when}>{recordWhen(record)}</Text>
          {sectionsOf(record).map((s) => (
            <View key={s.label} style={cardStyles.section} wrap={false}>
              <Text style={cardStyles.label}>{s.label}</Text>
              <Text style={cardStyles.value}>{s.value}</Text>
            </View>
          ))}
        </Page>
      ))}
    </Document>
  );
}

const tableStyles = StyleSheet.create({
  page: { padding: 20, fontSize: 8, color: COLORS.text, fontFamily: "Helvetica" },
  row: { flexDirection: "row", borderBottom: `1px solid ${COLORS.border}` },
  headerRow: { flexDirection: "row", backgroundColor: "#eef3f3" },
  cell: { flex: 1, padding: 5, borderRight: `1px solid ${COLORS.border}` },
  headerCell: {
    flex: 1,
    padding: 5,
    borderRight: `1px solid ${COLORS.border}`,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
    fontSize: 7,
  },
  value: { lineHeight: 1.3 },
});

/** Table layout — A4 landscape, one row per record across the 7 columns. */
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
            {sectionsOf(record).map((s) => (
              <Text key={s.label} style={{ ...tableStyles.cell, ...tableStyles.value }}>
                {s.value}
              </Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function buildPdfBlob(
  layout: ExportLayout,
  records: ThoughtRecord[],
): Promise<Blob> {
  const doc = layout === "card" ? <CardDoc records={records} /> : <TableDoc records={records} />;
  return pdf(doc).toBlob();
}
