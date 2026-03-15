import type { Recommendation, ResolvedHero, Role } from "@/lib/types";
import type { DraftContext } from "@/lib/types/draft";
import { getResolvedHero } from "@/lib/data/resolvedHeroes";
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
  if (role === "Tank") return ["reinhardt", "zarya", "winston", "dva"];
  if (role === "DPS") return ["reaper", "cassidy", "tracer", "bastion"];
  if (role === "Support") return ["ana", "brigitte", "kiriko", "lucio"];
  return ["ana", "tracer", "reaper", "widowmaker"];
}

function threatCountersCandidate(candidate: ResolvedHero, threatId: string) {
  const threat = getResolvedHero(threatId);
  if (!threat) return false;

  return (
    threat.strongInto.includes(candidate.id) ||
    threat.strongInto.includes(candidate.name)
  );
}

function candidateHandlesThreat(candidate: ResolvedHero, threatId: string) {
  return (
    candidate.strongInto.includes(threatId) ||
    candidate.strongInto.includes(getResolvedHero(threatId)?.name ?? "")
  );
}

function getStabilityModifier(candidate: ResolvedHero, likelyThreatIds: string[]) {
  let score = 0;
  const reasons: string[] = [];

  const uniqueThreatIds = Array.from(new Set(likelyThreatIds));
  const trueCounters = uniqueThreatIds.filter((threatId) =>
    threatCountersCandidate(candidate, threatId),
  );
  const favorableMatchups = uniqueThreatIds.filter((threatId) =>
    candidateHandlesThreat(candidate, threatId),
  );

  if (trueCounters.length === 0) {
    score += 3;
    reasons.push("Looks stable into the most likely unseen threats");
  } else if (trueCounters.length === 1) {
    score += 1;
    reasons.push("Should remain playable even if the last hidden pick is hostile");
  } else {
    score -= 2;
    reasons.push("More fragile if the unrevealed picks are natural counters");
  }

  if (favorableMatchups.length >= 2) {
    score += 1;
    reasons.push("Still has useful upside into several likely hidden picks");
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

      const likelyThreatIds = unseenEnemyRoles.flatMap((role) =>
        commonUnseenThreatIds(role),
      );

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
