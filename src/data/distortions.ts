/**
 * The ten cognitive distortions (Beck / Burns), source:
 * documents/Les distorsions cognitives.pdf.
 * Only stable English ids live here; name/definition/example are in the i18n locale
 * under `distortion.<id>.{name,definition,example}`.
 */
export type DistortionId =
  | "all-or-nothing"
  | "overgeneralization"
  | "selective-abstraction"
  | "disqualifying-the-positive"
  | "jumping-to-conclusions"
  | "magnification-minimization"
  | "emotional-reasoning"
  | "should-statements"
  | "labeling"
  | "personalization";

export const DISTORTION_IDS: readonly DistortionId[] = [
  "all-or-nothing",
  "overgeneralization",
  "selective-abstraction",
  "disqualifying-the-positive",
  "jumping-to-conclusions",
  "magnification-minimization",
  "emotional-reasoning",
  "should-statements",
  "labeling",
  "personalization",
] as const;
