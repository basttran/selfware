import type { defaultNS, resources } from "@/i18n/i18n.ts";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)["fr"];
  }
}
