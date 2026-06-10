import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SettingsProvider } from "@/app/SettingsProvider.tsx";
import "@/i18n/i18n.ts";
import { PinGate } from "@/pin/PinGate.tsx";
import { DetailScreen } from "@/features/detail/DetailScreen.tsx";
import { HistoryScreen } from "@/features/history/HistoryScreen.tsx";
import { SettingsScreen } from "@/features/settings/SettingsScreen.tsx";
import { WizardScreen } from "@/features/wizard/WizardScreen.tsx";

export function App() {
  return (
    <SettingsProvider>
      <PinGate>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <div className="mx-auto min-h-full max-w-2xl">
            <Routes>
              <Route path="/" element={<HistoryScreen />} />
              <Route path="/record/new" element={<WizardScreen mode="new" />} />
              <Route path="/record/:id/edit" element={<WizardScreen mode="edit" />} />
              <Route path="/record/:id" element={<DetailScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
            </Routes>
          </div>
        </BrowserRouter>
      </PinGate>
    </SettingsProvider>
  );
}
