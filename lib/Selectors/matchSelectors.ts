import type { MatchFormat, ResolvedHero, Role } from "@/lib/types";
import type { BanPhaseState } from "@/lib/types/bans";
import type { DraftContext } from "@/lib/types/draft";
import { resolvedHeroes } from "@/lib/data/resolvedHeroes";

export type SelectorState = {
  matchFormat: MatchFormat;
  selectedRole: Role;
  team: (ResolvedHero | null)[];
  enemy: (ResolvedHero | null)[];
  banPhase: BanPhaseState;
  draftContext: DraftContext;
};

export function getVisibleAlliedHeroes(state: SelectorState): ResolvedHero[] {
  if (state.matchFormat === "stadium" && state.draftContext.enabled) {
    return state.draftContext.slots
      .filter((slot) => slot.team === "ally" && slot.isKnown && slot.heroId)
      .map((slot) => resolvedHeroes.find((hero) => hero.id === slot.heroId))
      .filter(Boolean) as ResolvedHero[];
  }

  return state.team.filter(Boolean) as ResolvedHero[];
}

export function getVisibleEnemyHeroes(state: SelectorState): ResolvedHero[] {
  if (state.matchFormat === "stadium" && state.draftContext.enabled) {
    return state.draftContext.slots
      .filter((slot) => slot.team === "enemy" && slot.isKnown && slot.heroId)
      .map((slot) => resolvedHeroes.find((hero) => hero.id === slot.heroId))
      .filter(Boolean) as ResolvedHero[];
  }

  return state.enemy.filter(Boolean) as ResolvedHero[];
}

export function getCurrentRecommendationContext(state: SelectorState) {
  return {
    allies: getVisibleAlliedHeroes(state),
    enemies: getVisibleEnemyHeroes(state),
    bannedHeroIds: state.banPhase.bannedHeroIds,
    format: state.matchFormat,
  };
}

export function getAvailableHeroesForPicker(state: SelectorState, role: Role): ResolvedHero[] {
  return resolvedHeroes.filter(
    (hero) => hero.role === role && !state.banPhase.bannedHeroIds.includes(hero.id),
  );
}

export function getPlayableRecommendationCandidates(state: SelectorState): ResolvedHero[] {
  const visibleAllies = getVisibleAlliedHeroes(state);

  return resolvedHeroes.filter(
    (hero) =>
      hero.role === state.selectedRole &&
      !visibleAllies.some((ally) => ally.id === hero.id) &&
      !state.banPhase.bannedHeroIds.includes(hero.id),
  );
}
