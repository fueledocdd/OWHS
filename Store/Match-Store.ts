import { create } from "zustand";

import { mapDefinitions, STORAGE_KEY } from "@/lib/data/maps";
import { resolvedHeroes } from "@/lib/data/resolvedHeroes";
import { rankRecommendations } from "@/lib/scoring/recommendations";
import { rankStadiumDraftRecommendations } from "@/lib/scoring/stadiumDraft";
import { isHeroPlayable } from "@/lib/utils/legality";

import type {
  MatchFormat,
  Mode,
  Rank,
  Recommendation,
  ResolvedHero,
  Role,
} from "@/lib/types";
import type { BanPhaseState, BanRecommendation } from "@/lib/types/bans";
import type {
  DraftContext,
  DraftPhase,
  DraftSlotState,
  DraftTeamSide,
} from "@/lib/types/draft";
import type { UserProfile } from "@/lib/types/userProfile";

type ActiveSelection = {
  side: "team" | "enemy";
  index: number;
};

type MatchStore = {
  matchFormat: MatchFormat;
  selectedRole: Role;
  selectedMode: Mode;
  selectedMap: string;
  selectedRank: Rank;

  team: (ResolvedHero | null)[];
  enemy: (ResolvedHero | null)[];

  favoriteHeroIds: string[];
  recentHeroIds: string[];
  activeSelection: ActiveSelection;
  detailHero: Recommendation | null;

  banPhase: BanPhaseState;
  userProfile: UserProfile;
  draftContext: DraftContext;

  setMatchFormat: (matchFormat: MatchFormat) => void;
  setSelectedRole: (role: Role) => void;
  setSelectedMode: (mode: Mode) => void;
  setSelectedMap: (map: string) => void;
  setSelectedRank: (rank: Rank) => void;

  setTeamHero: (index: number, hero: ResolvedHero | null) => void;
  setEnemyHero: (index: number, hero: ResolvedHero | null) => void;

  setActiveSelection: (selection: ActiveSelection) => void;
  setDetailHero: (recommendation: Recommendation | null) => void;

  toggleFavorite: (heroId: string) => void;
  setPreferredHero: (heroId?: string) => void;
  toggleBannedHero: (heroId: string) => void;
  clearBans: () => void;

  setDraftPhase: (phase: DraftPhase) => void;
  setDraftSlotKnownHero: (
    team: DraftTeamSide,
    slotIndex: number,
    heroId?: string,
  ) => void;
  setDraftSlotExpectedRole: (
    team: DraftTeamSide,
    slotIndex: number,
    role?: Role,
  ) => void;
  setDraftSlotKnownState: (
    team: DraftTeamSide,
    slotIndex: number,
    isKnown: boolean,
  ) => void;
  resetDraftContext: () => void;

  getRecommendations: () => Recommendation[];
  getBanRecommendations: () => BanRecommendation[];

  persistState: () => void;
};

type PersistedMatchState = {
  matchFormat: MatchFormat;
  selectedRole: Role;
  selectedMode: Mode;
  selectedMap: string;
  selectedRank: Rank;
  favoriteHeroIds: string[];
  recentHeroIds: string[];
  banPhase: BanPhaseState;
  userProfile: UserProfile;
  draftContext: DraftContext;
};

function getTeamSize(matchFormat: MatchFormat) {
  if (matchFormat === "6v6") return 6;
  if (matchFormat === "stadium") return 5;
  return 5;
}

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

function getMapsForFormat(matchFormat: MatchFormat) {
  return mapDefinitions
    .filter((map) => map.supportedFormats.includes(matchFormat))
    .map((map) => map.name);
}

function getDefaultMap(matchFormat: MatchFormat) {
  const maps = getMapsForFormat(matchFormat);
  return maps[0] ?? "King's Row";
}

function getOnboardingDefaults(matchFormat: MatchFormat): {
  selectedMode: Mode;
  selectedRole: Role;
  selectedRank: Rank;
  selectedMap: string;
} {
  if (matchFormat === "stadium") {
    return {
      selectedMode: "Stadium",
      selectedRole: "Tank",
      selectedRank: "Gold",
      selectedMap: getDefaultMap(matchFormat),
    };
  }

  return {
    selectedMode: "Competitive",
    selectedRole: "Tank",
    selectedRank: "Gold",
    selectedMap: getDefaultMap(matchFormat),
  };
}

function clampSelectionIndex(index: number, matchFormat: MatchFormat) {
  const maxIndex = getTeamSize(matchFormat) - 1;
  return Math.max(0, Math.min(index, maxIndex));
}

function normalizeRecentHeroIds(
  recentHeroIds: string[],
  heroId: string,
  limit = 8,
) {
  return [heroId, ...recentHeroIds.filter((id) => id !== heroId)].slice(0, limit);
}

function buildComfortMap(userProfile: UserProfile) {
  return Object.fromEntries(
    userProfile.heroPreferences.map((pref) => [pref.heroId, pref.comfort]),
  ) as Record<string, number>;
}

function getVisibleAlliedHeroes(state: MatchStore): ResolvedHero[] {
  if (state.matchFormat === "stadium" && state.draftContext.enabled) {
    return state.draftContext.slots
      .filter((slot) => slot.team === "ally" && slot.isKnown && slot.heroId)
      .map((slot) => resolvedHeroes.find((hero) => hero.id === slot.heroId) ?? null)
      .filter(Boolean) as ResolvedHero[];
  }

  return state.team.filter(Boolean) as ResolvedHero[];
}

function getVisibleEnemyHeroes(state: MatchStore): ResolvedHero[] {
  if (state.matchFormat === "stadium" && state.draftContext.enabled) {
    return state.draftContext.slots
      .filter((slot) => slot.team === "enemy" && slot.isKnown && slot.heroId)
      .map((slot) => resolvedHeroes.find((hero) => hero.id === slot.heroId) ?? null)
      .filter(Boolean) as ResolvedHero[];
  }

  return state.enemy.filter(Boolean) as ResolvedHero[];
}

function getRecommendedCandidates(state: MatchStore): ResolvedHero[] {
  const visibleAllies = getVisibleAlliedHeroes(state);
  const selectedHeroIds = visibleAllies.map((hero) => hero.id);

  return resolvedHeroes.filter((hero) => {
    if (hero.role !== state.selectedRole) return false;

    return isHeroPlayable({
      heroId: hero.id,
      matchFormat: state.matchFormat,
      banPhase: state.banPhase,
      selectedHeroIds,
    });
  });
}

function getDefaultUserProfile(): UserProfile {
  return {
    heroPreferences: [],
  };
}

function safeLoadPersistedState(): Partial<PersistedMatchState> | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PersistedMatchState>;
  } catch {
    return null;
  }
}

export const useMatchStore = create<MatchStore>((set, get) => {
  const persisted = safeLoadPersistedState();
  const initialFormat = persisted?.matchFormat ?? "5v5";
  const defaults = getOnboardingDefaults(initialFormat);

  const initialMap =
    persisted?.selectedMap &&
    getMapsForFormat(initialFormat).includes(persisted.selectedMap)
      ? persisted.selectedMap
      : defaults.selectedMap;

  const initialState: Omit<
    MatchStore,
    | "setMatchFormat"
    | "setSelectedRole"
    | "setSelectedMode"
    | "setSelectedMap"
    | "setSelectedRank"
    | "setTeamHero"
    | "setEnemyHero"
    | "setActiveSelection"
    | "setDetailHero"
    | "toggleFavorite"
    | "setPreferredHero"
    | "toggleBannedHero"
    | "clearBans"
    | "setDraftPhase"
    | "setDraftSlotKnownHero"
    | "setDraftSlotExpectedRole"
    | "setDraftSlotKnownState"
    | "resetDraftContext"
    | "getRecommendations"
    | "getBanRecommendations"
    | "persistState"
  > = {
    matchFormat: initialFormat,
    selectedRole: persisted?.selectedRole ?? defaults.selectedRole,
    selectedMode: persisted?.selectedMode ?? defaults.selectedMode,
    selectedMap: initialMap,
    selectedRank: persisted?.selectedRank ?? defaults.selectedRank,

    team: Array(getTeamSize(initialFormat)).fill(null),
    enemy: Array(getTeamSize(initialFormat)).fill(null),

    favoriteHeroIds: persisted?.favoriteHeroIds ?? [],
    recentHeroIds: persisted?.recentHeroIds ?? [],
    activeSelection: { side: "team", index: 0 },
    detailHero: null,

    banPhase: persisted?.banPhase ?? {
      bannedHeroIds: [],
      preferredHeroId: undefined,
    },

    userProfile: persisted?.userProfile ?? getDefaultUserProfile(),

    draftContext: persisted?.draftContext ?? {
      enabled: initialFormat === "stadium",
      phase: "prepick",
      slots: buildDefaultDraftSlots(initialFormat),
    },
  };

  return {
    ...initialState,

    persistState: () => {
      if (typeof window === "undefined") return;

      const state = get();
      const payload: PersistedMatchState = {
        matchFormat: state.matchFormat,
        selectedRole: state.selectedRole,
        selectedMode: state.selectedMode,
        selectedMap: state.selectedMap,
        selectedRank: state.selectedRank,
        favoriteHeroIds: state.favoriteHeroIds,
        recentHeroIds: state.recentHeroIds,
        banPhase: state.banPhase,
        userProfile: state.userProfile,
        draftContext: state.draftContext,
      };

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // Ignore storage failures.
      }
    },

    setMatchFormat: (matchFormat) => {
      const defaults = getOnboardingDefaults(matchFormat);

      set({
        matchFormat,
        selectedMode: defaults.selectedMode,
        selectedRole: defaults.selectedRole,
        selectedRank: defaults.selectedRank,
        selectedMap: defaults.selectedMap,
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

    setSelectedRole: (selectedRole) => {
      set({ selectedRole });
      get().persistState();
    },

    setSelectedMode: (selectedMode) => {
      set({ selectedMode });
      get().persistState();
    },

    setSelectedMap: (selectedMap) => {
      set({ selectedMap });
      get().persistState();
    },

    setSelectedRank: (selectedRank) => {
      set({ selectedRank });
      get().persistState();
    },

    setTeamHero: (index, hero) => {
      const state = get();
      const team = state.team.slice();
      team[index] = hero;

      set({
        team,
        recentHeroIds: hero
          ? normalizeRecentHeroIds(state.recentHeroIds, hero.id)
          : state.recentHeroIds,
      });

      get().persistState();
    },

    setEnemyHero: (index, hero) => {
      const enemy = get().enemy.slice();
      enemy[index] = hero;

      set({ enemy });
      get().persistState();
    },

    setActiveSelection: (activeSelection) => {
      set({
        activeSelection: {
          side: activeSelection.side,
          index: clampSelectionIndex(activeSelection.index, get().matchFormat),
        },
      });
    },

    setDetailHero: (detailHero) => {
      set({ detailHero });
    },

    toggleFavorite: (heroId) => {
      const favoriteHeroIds = get().favoriteHeroIds.includes(heroId)
        ? get().favoriteHeroIds.filter((id) => id !== heroId)
        : [...get().favoriteHeroIds, heroId];

      set({ favoriteHeroIds });
      get().persistState();
    },

    setPreferredHero: (heroId) => {
      set({
        banPhase: {
          ...get().banPhase,
          preferredHeroId: heroId,
        },
      });

      get().persistState();
    },

    toggleBannedHero: (heroId) => {
      const bannedHeroIds = get().banPhase.bannedHeroIds.includes(heroId)
        ? get().banPhase.bannedHeroIds.filter((id) => id !== heroId)
        : [...get().banPhase.bannedHeroIds, heroId];

      set({
        banPhase: {
          ...get().banPhase,
          bannedHeroIds,
        },
      });

      get().persistState();
    },

    clearBans: () => {
      set({
        banPhase: {
          bannedHeroIds: [],
          preferredHeroId: undefined,
        },
      });

      get().persistState();
    },

    setDraftPhase: (phase) => {
      set({
        draftContext: {
          ...get().draftContext,
          phase,
        },
      });

      get().persistState();
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

      set({
        draftContext: {
          ...get().draftContext,
          slots,
        },
      });

      get().persistState();
    },

    setDraftSlotExpectedRole: (team, slotIndex, role) => {
      const slots = get().draftContext.slots.map((slot) => {
        if (slot.team === team && slot.slotIndex === slotIndex) {
          return {
            ...slot,
            expectedRole: role,
          };
        }

        return slot;
      });

      set({
        draftContext: {
          ...get().draftContext,
          slots,
        },
      });

      get().persistState();
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

      set({
        draftContext: {
          ...get().draftContext,
          slots,
        },
      });

      get().persistState();
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

      get().persistState();
    },

    getRecommendations: () => {
      const state = get();
      const candidates = getRecommendedCandidates(state);
      const userComfortByHeroId = buildComfortMap(state.userProfile);

      if (state.matchFormat === "stadium" && state.draftContext.enabled) {
        const knownAllies = state.draftContext.slots
          .filter((slot) => slot.team === "ally" && slot.isKnown && slot.heroId)
          .map((slot) => resolvedHeroes.find((hero) => hero.id === slot.heroId) ?? null)
          .filter(Boolean) as ResolvedHero[];

        const knownEnemies = state.draftContext.slots
          .filter((slot) => slot.team === "enemy" && slot.isKnown && slot.heroId)
          .map((slot) => resolvedHeroes.find((hero) => hero.id === slot.heroId) ?? null)
          .filter(Boolean) as ResolvedHero[];

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

      const alliedHeroes = state.team.filter(Boolean) as ResolvedHero[];
      const enemyHeroes = state.enemy.filter(Boolean) as ResolvedHero[];

      return rankRecommendations(
        candidates,
        alliedHeroes,
        enemyHeroes,
        state.selectedMap,
        state.selectedRank,
        state.selectedMode,
        state.favoriteHeroIds,
        state.recentHeroIds,
        userComfortByHeroId,
      );
    },

    getBanRecommendations: () => {
      const state = get();

      if (state.matchFormat === "stadium" || state.selectedMode !== "Competitive") {
        return [];
      }

      const alreadyBanned = new Set(state.banPhase.bannedHeroIds);
      const preferredHero = state.banPhase.preferredHeroId
        ? resolvedHeroes.find((hero) => hero.id === state.banPhase.preferredHeroId) ?? null
        : null;

      const alliedHeroes = getVisibleAlliedHeroes(state);
      const recommendationContext = rankRecommendations(
        getRecommendedCandidates(state),
        alliedHeroes,
        [],
        state.selectedMap,
        state.selectedRank,
        state.selectedMode,
        state.favoriteHeroIds,
        state.recentHeroIds,
        buildComfortMap(state.userProfile),
      );

      const likelyPick = preferredHero ?? recommendationContext[0]?.hero ?? null;
      const teamStyleTags = new Set(
        alliedHeroes.flatMap((hero) =>
          hero.tags.filter((tag) => ["brawl", "dive", "poke"].includes(tag)),
        ),
      );

      return resolvedHeroes
        .filter((hero) => !alreadyBanned.has(hero.id))
        .map((hero) => {
          let score = 0;
          const reasons: string[] = [];

          if (likelyPick) {
            const threatensLikelyPick =
              hero.strongInto.includes(likelyPick.id) ||
              hero.strongInto.includes(likelyPick.name);

            if (threatensLikelyPick) {
              score += 14;
              reasons.push(`Strong into your likely pick, ${likelyPick.name}`);
            }

            const likelyPickHandlesHero =
              likelyPick.strongInto.includes(hero.id) ||
              likelyPick.strongInto.includes(hero.name);

            if (likelyPickHandlesHero) {
              score -= 4;
            }
          }

          if (
            teamStyleTags.has("dive") &&
            (hero.tags.includes("anti-dive") ||
              hero.name === "Brigitte" ||
              hero.name === "Cassidy")
          ) {
            score += 8;
            reasons.push("Disrupts a likely dive plan");
          }

          if (
            teamStyleTags.has("brawl") &&
            (hero.name === "Pharah" ||
              hero.name === "Echo" ||
              hero.tags.includes("poke"))
          ) {
            score += 6;
            reasons.push("Can punish slower brawl setups");
          }

          if (
            teamStyleTags.has("poke") &&
            (hero.name === "Winston" ||
              hero.name === "D.Va" ||
              hero.tags.includes("dive"))
          ) {
            score += 6;
            reasons.push("Can collapse on poke backlines");
          }

          if (hero.role === state.selectedRole) {
            score += 2;
            reasons.push("Relevant to your role matchup");
          }

          if (score === 0) {
            reasons.push("General disruption ban");
          }

          return {
            heroId: hero.id,
            score,
            reasons,
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
    },
  };
});
