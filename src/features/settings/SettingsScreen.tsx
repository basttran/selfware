import { useTranslation } from "react-i18next";
import { AppBar } from "@/components/AppBar.tsx";
import { ColorSettings } from "@/features/settings/ColorSettings.tsx";
import { DataSettings } from "@/features/settings/DataSettings.tsx";
import { PinSettings } from "@/features/settings/PinSettings.tsx";
import { ThemeSettings } from "@/features/settings/ThemeSettings.tsx";

export function SettingsScreen() {
  const { t } = useTranslation();
  return (
    <div className="min-h-full pb-8">
      <AppBar title={t("settings.title")} back="/" />
      <main className="space-y-4 p-4">
        <PinSettings />
        <DataSettings />
        <ThemeSettings />
        <ColorSettings />
      </main>
    </div>
  );
}
