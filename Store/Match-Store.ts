import { create } from "zustand";
import type { MatchFormat, Mode, Rank, Recommendation, ResolvedHero, Role } from "@/lib/types";
import { resolvedHeroes } from "@/lib/data/resolvedHeroes";
import { rankRecommendations } from "@/lib/scoring/recommendations";

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function getTeamSize(matchFormat: MatchFormat) {
  return matchFormat === "6v6" ? 6 : 5;
}

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
  detailHero: Recommendation | null;
  activeSelection: ActiveSelection;
  setMatchFormat: (format: MatchFormat) => void;
  setSelectedRole: (role: Role) => void;
  setSelectedMode: (mode: Mode) => void;
  setSelectedMap: (map: string) => void;
  setSelectedRank: (rank: Rank) => void;
  setTeamHero: (index: number, hero: ResolvedHero | null) => void;
  setEnemyHero: (index: number, hero: ResolvedHero | null) => void;
  setActiveSelection: (selection: ActiveSelection) => void;
  clearMatch: () => void;
  toggleFavorite: (heroId: string) => void;
  setDetailHero: (hero: Recommendation | null) => void;
  getRecommendations: () => Recommendation[];
};

export const useMatchStore = create<MatchStore>((set, get) => ({
  matchFormat: "5v5",
  selectedRole: "DPS",
  selectedMode: "Competitive",
  selectedMap: "King's Row",
  selectedRank: "Gold",
  team: Array(getTeamSize("5v5")).fill(null),
  enemy: Array(getTeamSize("5v5")).fill(null),
  favoriteHeroIds: ["ana", "soldier76", "dva"],
  recentHeroIds: ["cassidy", "kiriko", "sigma"],
  detailHero: null,
  activeSelection: { side: "team", index: 0 },
  setMatchFormat: (matchFormat) =>
    set({
      matchFormat,
      team: Array(getTeamSize(matchFormat)).fill(null),
      enemy: Array(getTeamSize(matchFormat)).fill(null),
      activeSelection: { side: "team", index: 0 },
    }),
  setSelectedRole: (selectedRole) => set({ selectedRole }),
  setSelectedMode: (selectedMode) => set({ selectedMode }),
  setSelectedMap: (selectedMap) => set({ selectedMap }),
  setSelectedRank: (selectedRank) => set({ selectedRank }),
  setActiveSelection: (activeSelection) => set({ activeSelection }),
  setTeamHero: (index, hero) => {
    const next = [...get().team];
    next[index] = hero;
    set({
      team: next,
      activeSelection: { side: "team", index },
      recentHeroIds: hero ? unique([hero.id, ...get().recentHeroIds]).slice(0, 6) : get().recentHeroIds,
    });
  },
  setEnemyHero: (index, hero) => {
    const next = [...get().enemy];
    next[index] = hero;
    set({
      enemy: next,
      activeSelection: { side: "enemy", index },
    });
  },
  clearMatch: () =>
    set({
      team: Array(getTeamSize(get().matchFormat)).fill(null),
      enemy: Array(getTeamSize(get().matchFormat)).fill(null),
      detailHero: null,
      activeSelection: { side: "team", index: 0 },
    }),
  toggleFavorite: (heroId) => {
    const current = get().favoriteHeroIds;
    set({
      favoriteHeroIds: current.includes(heroId)
        ? current.filter((id) => id !== heroId)
        : [...current, heroId],
    });
  },
  setDetailHero: (detailHero) => set({ detailHero }),
  getRecommendations: () => {
    const state = get();
    const alliedHeroes = state.team.filter(Boolean) as ResolvedHero[];
    const enemyHeroes = state.matchFormat === "stadium"
      ? []
      : (state.enemy.filter(Boolean) as ResolvedHero[]);
    const candidates = resolvedHeroes.filter(
      (hero) => hero.role === state.selectedRole && !alliedHeroes.some((ally) => ally.id === hero.id),
    );

    return rankRecommendations(
      candidates,
      alliedHeroes,
      enemyHeroes,
      state.selectedMap,
      state.selectedRank,
      state.selectedMode,
      state.favoriteHeroIds,
      state.recentHeroIds,
    );
  },
}));
