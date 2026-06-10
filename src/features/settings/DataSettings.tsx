import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/Button.tsx";
import { ConfirmDialog } from "@/components/ConfirmDialog.tsx";
import { exportJSON, importJSON } from "@/db/backup.ts";
import { downloadBlob } from "@/features/export/share.ts";

export function DataSettings() {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingFile = useRef<File | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function exportData() {
    const json = await exportJSON(Date.now());
    downloadBlob(new Blob([json], { type: "application/json" }), `selfware-${Date.now()}.json`);
    setMessage(t("settings.data.exported"));
  }

  function pickFile() {
    fileRef.current?.click();
  }

  function onFileSelected(file: File | undefined) {
    if (!file) return;
    pendingFile.current = file;
    setConfirmOpen(true);
  }

  async function confirmImport() {
    setConfirmOpen(false);
    const file = pendingFile.current;
    if (!file) return;
    try {
      await importJSON(await file.text());
      setMessage(t("settings.data.imported"));
    } catch {
      setMessage(t("settings.data.importError"));
    } finally {
      pendingFile.current = null;
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <section className="rounded-card border border-border bg-surface-raised p-4">
      <h2 className="font-semibold text-sm">{t("settings.data.title")}</h2>
      <p className="mt-1 mb-3 text-text-muted text-xs leading-relaxed">
        {t("settings.data.description")}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="soft" onClick={() => void exportData()}>
          {t("settings.data.export")}
        </Button>
        <Button variant="soft" onClick={pickFile}>
          {t("settings.data.import")}
        </Button>
      </div>
      {message && <p className="mt-2 text-primary text-xs">{message}</p>}

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => onFileSelected(e.target.files?.[0])}
      />
      <ConfirmDialog
        open={confirmOpen}
        message={t("settings.data.importConfirm")}
        onConfirm={() => void confirmImport()}
        onCancel={() => {
          setConfirmOpen(false);
          pendingFile.current = null;
        }}
      />
    </section>
  );
}
