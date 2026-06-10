import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "@/i18n/locales/fr.json";

export const defaultNS = "translation";
export const resources = { fr: { translation: fr } } as const;

i18n.use(initReactI18next).init({
  resources,
  lng: "fr",
  fallbackLng: "fr",
  defaultNS,
  interpolation: { escapeValue: false },
});

export default i18n;
