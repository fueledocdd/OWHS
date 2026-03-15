import type { MatchFormat, Mode, Rank, Role } from "@/lib/types";

export type OnboardingDefaults = {
  matchFormat: MatchFormat;
  selectedMode: Mode;
  selectedRole: Role;
  selectedRank: Rank;
  selectedMap?: string;
  suggestedProfilePrompt: string;
};

export const onboardingDefaultsByFormat: Record<MatchFormat, OnboardingDefaults> = {
  "5v5": {
    matchFormat: "5v5",
    selectedMode: "Competitive",
    selectedRole: "DPS",
    selectedRank: "Gold",
    selectedMap: "King's Row",
    suggestedProfilePrompt: "Set your mains and comfort labels so recommendations reflect what you can actually execute.",
  },
  "6v6": {
    matchFormat: "6v6",
    selectedMode: "Competitive",
    selectedRole: "DPS",
    selectedRank: "Gold",
    selectedMap: "King's Row",
    suggestedProfilePrompt: "Set your comfort labels with 6v6 in mind, especially if you flex into older dual-tank styles.",
  },
  stadium: {
    matchFormat: "stadium",
    selectedMode: "Stadium",
    selectedRole: "DPS",
    selectedRank: "Gold",
    selectedMap: "Wuxing University",
    suggestedProfilePrompt: "Pick comfort labels for heroes you would actually open on in Stadium, not just heroes you like in standard comp.",
  },
};

export function getOnboardingDefaults(matchFormat: MatchFormat) {
  return onboardingDefaultsByFormat[matchFormat];
}
