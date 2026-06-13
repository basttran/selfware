import { useTranslation } from "react-i18next";
import { PaletteSelector } from "@/components/PaletteSelector.tsx";
import { usePalette } from "@/theme/usePalette.ts";

export function ThemeSettings() {
  const { t } = useTranslation();
  const { palette, setPalette } = usePalette();

  return (
    <section className="rounded-card border border-border bg-surface-raised p-4">
      <h2 className="mb-3 font-semibold text-sm">{t("settings.theme.title")}</h2>
      <PaletteSelector value={palette} onChange={setPalette} />
    </section>
  );
}
