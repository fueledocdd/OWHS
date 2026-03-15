// add imports
import type { DraftContext, DraftSlotState, DraftTeamSide, DraftPhase } from "@/lib/types/draft";
import { rankStadiumDraftRecommendations } from "@/lib/scoring/stadiumDraft";

function buildDefaultDraftSlots(matchFormat: MatchFormat): DraftSlotState[] {
  const teamSize = getTeamSize(matchFormat);
  const slots: DraftSlotState[] = [];

  for (let i = 0; i < teamSize; i += 1) {
    slots.push({ team: "ally", slotIndex: i, isKnown: false });
  }
  for (let i = 0; i < teamSize; i += 1) {
    slots.push({ team: "enemy", slotIndex: i, isKnown: false });
  }

  return slots;
}

type MatchStore = {
  // existing fields...
  draftContext: DraftContext;
  setDraftPhase: (phase: DraftPhase) => void;
  setDraftSlotKnownHero: (team: DraftTeamSide, slotIndex: number, heroId?: string) => void;
  setDraftSlotExpectedRole: (team: DraftTeamSide, slotIndex: number, role?: Role) => void;
  setDraftSlotKnownState: (team: DraftTeamSide, slotIndex: number, isKnown: boolean) => void;
  resetDraftContext: () => void;
};

// in initial state
 draftContext: {
   enabled: false,
   phase: "prepick",
   slots: buildDefaultDraftSlots("5v5"),
 },

// in setMatchFormat
 setMatchFormat: (matchFormat) => {
   const defaults = getOnboardingDefaults(matchFormat);
   set({
     matchFormat,
     selectedMode: defaults.selectedMode,
     selectedRole: defaults.selectedRole,
     selectedRank: defaults.selectedRank,
     selectedMap: defaults.selectedMap ?? get().selectedMap,
     team: Array(getTeamSize(matchFormat)).fill(null),
     enemy: Array(getTeamSize(matchFormat)).fill(null),
     activeSelection: { side: "team", index: 0 },
     detailHero: null,
     banPhase: { bannedHeroIds: [], preferredHeroId: undefined },
     draftContext: {
       enabled: matchFormat === "stadium",
       phase: "prepick",
       slots: buildDefaultDraftSlots(matchFormat),
     },
   });
   get().persistState();
 },

// add implementations
setDraftPhase: (phase) => {
  set({ draftContext: { ...get().draftContext, phase } });
},

setDraftSlotKnownHero: (team, slotIndex, heroId) => {
  const slots = get().draftContext.slots.map((slot) => {
    if (slot.team === team && slot.slotIndex === slotIndex) {
      return {
        ...slot,
        heroId,
        isKnown: !!heroId,
      };
    }
    return slot;
  });

  set({ draftContext: { ...get().draftContext, slots } });
},

setDraftSlotExpectedRole: (team, slotIndex, role) => {
  const slots = get().draftContext.slots.map((slot) => {
    if (slot.team === team && slot.slotIndex === slotIndex) {
      return { ...slot, expectedRole: role };
    }
    return slot;
  });

  set({ draftContext: { ...get().draftContext, slots } });
},

setDraftSlotKnownState: (team, slotIndex, isKnown) => {
  const slots = get().draftContext.slots.map((slot) => {
    if (slot.team === team && slot.slotIndex === slotIndex) {
      return {
        ...slot,
        isKnown,
        heroId: isKnown ? slot.heroId : undefined,
      };
    }
    return slot;
  });

  set({ draftContext: { ...get().draftContext, slots } });
},

resetDraftContext: () => {
  const matchFormat = get().matchFormat;
  set({
    draftContext: {
      enabled: matchFormat === "stadium",
      phase: "prepick",
      slots: buildDefaultDraftSlots(matchFormat),
    },
  });
},

// inside getRecommendations()
if (state.matchFormat === "stadium" && state.draftContext.enabled) {
  const knownAllies = state.draftContext.slots
    .filter((slot) => slot.team === "ally" && slot.isKnown && slot.heroId)
    .map((slot) => resolvedHeroes.find((hero) => hero.id === slot.heroId))
    .filter(Boolean) as ResolvedHero[];

  const knownEnemies = state.draftContext.slots
    .filter((slot) => slot.team === "enemy" && slot.isKnown && slot.heroId)
    .map((slot) => resolvedHeroes.find((hero) => hero.id === slot.heroId))
    .filter(Boolean) as ResolvedHero[];

  const userComfortByHeroId = Object.fromEntries(
    state.userProfile.heroPreferences.map((pref) => [pref.heroId, pref.comfort]),
  );

  return rankStadiumDraftRecommendations({
    candidates,
    alliedHeroes: knownAllies,
    enemyHeroes: knownEnemies,
    selectedMap: state.selectedMap,
    selectedRank: state.selectedRank,
    selectedMode: state.selectedMode,
    draft: state.draftContext,
    userComfortByHeroId,
  });
}
