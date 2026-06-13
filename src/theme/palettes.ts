export interface Palette {
  id: string;
  label: string;
  /** OKLCH light-mode primary — used as the selector dot color. */
  dot: string;
}

export const PALETTES: readonly Palette[] = [
  { id: "default", label: "Sarcelle", dot: "oklch(0.530 0.065 196)" },
  { id: "amber",   label: "Ambre",    dot: "oklch(0.580 0.092 68)"  },
  { id: "slate",   label: "Ardoise",  dot: "oklch(0.480 0.060 295)" },
  { id: "rose",    label: "Grès rosé",dot: "oklch(0.550 0.065 15)"  },
];
