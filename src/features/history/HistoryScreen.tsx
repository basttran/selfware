import { useLiveQuery } from "dexie-react-hooks";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { AppBar } from "@/components/AppBar.tsx";
import { GitHubLink } from "@/components/GitHubLink.tsx";
import { getAllRecords } from "@/db/records.ts";
import type { ThoughtRecord } from "@/db/types.ts";
import { EmotionChips } from "@/features/history/EmotionChips.tsx";
import { formatDate, formatEventDate } from "@/lib/format.ts";

export function HistoryScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const records = useLiveQuery(async () => {
    const all = await getAllRecords();
    return all.sort((a, b) => b.createdAt - a.createdAt);
  }, []);

  return (
    <div className="min-h-full pb-24">
      <AppBar
        title={t("history.title")}
        right={
          <div className="flex items-center gap-1">
            <GitHubLink />
            <Link
              to="/settings"
              aria-label={t("nav.settings")}
              className="rounded-control px-2 py-1 text-text-muted text-xl hover:text-text"
            >
              ⚙
            </Link>
          </div>
        }
      />

      {records && records.length === 0 && (
        <p className="px-6 py-16 text-center text-sm text-text-muted leading-relaxed">
          {t("history.empty")}
        </p>
      )}

      <ul className="space-y-3 p-4">
        {records?.map((record) => (
          <RecordCard key={record.id} record={record} />
        ))}
      </ul>

      <button
        type="button"
        onClick={() => navigate("/record/new")}
        className="fixed right-5 bottom-5 z-20 flex h-14 items-center gap-2 rounded-full bg-primary px-5 text-primary-contrast shadow-lg transition-opacity hover:opacity-90"
      >
        <span className="text-2xl leading-none">+</span>
        <span className="font-medium text-sm">{t("nav.newRecord")}</span>
      </button>
    </div>
  );
}

function RecordCard({ record }: { record: ThoughtRecord }) {
  const { t } = useTranslation();
  const isDraft = record.status === "draft";
  const to = isDraft ? `/record/${record.id}/edit` : `/record/${record.id}`;
  const when = formatEventDate(record.eventDate, record.eventTime) || formatDate(record.createdAt);

  return (
    <li>
      <Link
        to={to}
        className="block rounded-card border border-border bg-surface-raised p-4 transition-colors hover:border-primary"
      >
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-text-muted text-xs">{when}</span>
          {isDraft && (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-primary text-xs">
              {t("history.draftBadge")}
            </span>
          )}
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed">
          {record.event.trim() || (
            <span className="text-text-muted italic">{t("history.noEvent")}</span>
          )}
        </p>
        <div className="mt-2">
          <EmotionChips emotions={record.emotions} />
        </div>
      </Link>
    </li>
  );
}
