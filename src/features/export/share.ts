/** Trigger a file download for a blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Share a PDF via the native share sheet when available, else download it. */
export async function sharePdf(blob: Blob, filename: string): Promise<void> {
  const file = new File([blob], filename, { type: "application/pdf" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return;
    } catch (err) {
      // User dismissed the share sheet — nothing more to do.
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Otherwise fall back to a download.
    }
  }
  downloadBlob(blob, filename);
}
