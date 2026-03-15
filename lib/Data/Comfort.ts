import type { ComfortLabel } from "@/lib/types/userProfile";

export const comfortLabelToScore: Record<ComfortLabel, number> = {
  Main: 10,
  Comfortable: 8,
  "Can play": 6,
  Default: 4,
  Avoid: 1,
};

export const comfortLabels: ComfortLabel[] = [
  "Main",
  "Comfortable",
  "Can play",
  "Default",
  "Avoid",
];
