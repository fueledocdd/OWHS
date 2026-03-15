import type { Recommendation, ResolvedHero, Role } from "@/lib/types";
import type { DraftContext } from "@/lib/types/draft";
import { scoreHero } from "@/lib/scoring/recommendations";

function countKnownSlots(draft: DraftContext) {
  return draft.slots.filter((slot) => slot.isKnown && slot.heroId).length;
}

function countTotalSlots(draft: DraftContext) {
  return draft.slots.length;
}

function estimateDraftCertainty(draft: DraftContext) {
  const total = countTotalSlots(draft);
  if (total === 0) return 0;
  return countKnownSlots(draft) / total;
}

function commonUnseenThreatIds(role?: Role): string[] {
  if (role === "Tank") return ["reaper", "bastion", "ana", "zarya"];
  if (role === "DPS") return ["cassidy", "brigitte", "dva", "winston"];
  if (role === "Support") return ["tracer", "genji", "sombra", "widowmaker"];
  return ["ana", "tracer", "reaper", "widowmaker"];
}

function getStabilityModifier(candidate: ResolvedHero, likelyThreatIds: string[]) {
  let score = 0;
  const reasons: string[] = [];

  const hardCounters = likelyThreatIds.filter(
    (threatId) => candidate.strongInto.includes(threatId) === false && candidate.strongInto.includes(threatId) !== true,
  );

  if (hardCounters.length === 0) {
    score += 3;
    reasons.push("Looks stable into the most likely unseen threats");
  } else if (hardCounters.length <= 1) {
    score += 1;
    reasons.push("Should remain playable even if the last hidden pick is hostile");
  } else {
    score -= 2;
    reasons.push("More fragile if the unrevealed picks are hard counters");
  }

  return { score, reasons };
}

export function rankStadiumDraftRecommendations(args: {
  candidates: ResolvedHero[];
  alliedHeroes: ResolvedHero[];
  enemyHeroes: ResolvedHero[];
  selectedMap: string;
  selectedRank: string;
  selectedMode: string;
  draft: DraftContext;
  userComfortByHeroId?: Record<string, number>;
}) {
  const {
    candidates,
    alliedHeroes,
    enemyHeroes,
    selectedMap,
    selectedRank,
    selectedMode,
    draft,
    userComfortByHeroId,
  } = args;

  const certainty = estimateDraftCertainty(draft);
  const unseenEnemyRoles = draft.slots
    .filter((slot) => slot.team === "enemy" && !slot.isKnown)
    .map((slot) => slot.expectedRole);

  return candidates
    .map((candidate) => {
      const base = scoreHero(
        candidate,
        alliedHeroes,
        enemyHeroes,
        selectedMap,
        selectedRank as any,
        selectedMode as any,
        userComfortByHeroId,
      ) as Recommendation;

      const likelyThreatIds = unseenEnemyRoles.flatMap((role) => commonUnseenThreatIds(role));
      const stability = getStabilityModifier(candidate, likelyThreatIds);

      const uncertaintyWeight = 1 - certainty;
      const stabilityBonus = Math.round(stability.score * 6 * uncertaintyWeight);

      return {
        ...base,
        total: base.total + stabilityBonus,
        reasons: [...base.reasons, ...stability.reasons],
      };
    })
    .sort((a, b) => b.total - a.total);
}
