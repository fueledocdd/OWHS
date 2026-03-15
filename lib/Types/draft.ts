import type { Role } from "@/lib/types";

export type DraftTeamSide = "ally" | "enemy";
export type DraftPhase = "prepick" | "partial-reveal" | "post-reveal";

export type DraftSlotState = {
  team: DraftTeamSide;
  slotIndex: number;
  heroId?: string;
  isKnown: boolean;
  expectedRole?: Role;
};

export type DraftContext = {
  enabled: boolean;
  phase: DraftPhase;
  slots: DraftSlotState[];
};
