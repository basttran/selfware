const dateTimeFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Epoch ms → "12 juin 2026 à 14:30". */
export function formatDateTime(ms: number): string {
  return dateTimeFmt.format(new Date(ms));
}

/** Epoch ms → "12 juin 2026". */
export function formatDate(ms: number): string {
  return dateFmt.format(new Date(ms));
}

/** ISO yyyy-mm-dd (+ optional HH:mm) → human date, or "" if empty. */
export function formatEventDate(iso?: string, time?: string): string {
  if (!iso) return "";
  const base = dateFmt.format(new Date(`${iso}T00:00:00`));
  return time ? `${base} à ${time}` : base;
}
