import type { Mode, Rank, Recommendation, ResolvedHero } from "@/lib/types";
import { inferTeamStyle } from "@/lib/scoring/teamStyle";
import { getMetaModifier } from "@/lib/scoring/meta";
import { getSubRoleModifier } from "@/lib/scoring/subRoles";

export const scoreWeights = {
  counter: 0.4,
  synergy: 0.25,
  map: 0.15,
  comfort: 0.12,
  meta: 0.05,
  subRole: 0.03,
};

export function scoreHero(
  candidate: ResolvedHero,
  alliedHeroes: ResolvedHero[],
  enemyHeroes: ResolvedHero[],
  selectedMap: string,
  selectedRank: Rank,
  selectedMode: Mode,
): Recommendation {
  let counter = 0;
  let synergy = 0;
  let map = 0;
  const comfort = candidate.comfort ?? 5;
  const meta = getMetaModifier(candidate, selectedRank, selectedMode);
  const subRoleResult = getSubRoleModifier(candidate, alliedHeroes, enemyHeroes, selectedMode);
  const subRole = subRoleResult.score;
  const reasons: string[] = [];
  const teamStyle = inferTeamStyle(alliedHeroes);

  enemyHeroes.forEach((enemy) => {
    if (candidate.strongInto.includes(enemy.name) || candidate.strongInto.includes(enemy.id)) counter += 18;
    if (candidate.tags.includes("hitscan") && ["Pharah", "Echo", "Mercy"].includes(enemy.name)) counter += 10;
    if (candidate.tags.includes("tank-buster") && enemy.role === "Tank") counter += 8;
    if (candidate.tags.includes("anti-dive") && ["Tracer", "Genji", "Winston", "D.Va", "Doomfist"].includes(enemy.name)) counter += 8;
    if (candidate.tags.includes("beam") && ["D.Va", "Genji", "Tracer"].includes(enemy.name)) counter += 6;
  });

  alliedHeroes.forEach((ally) => {
    if (candidate.goodWith.includes(ally.name) || candidate.goodWith.includes(ally.id)) synergy += 14;
    if (candidate.tags.includes("dive") && ally.tags.includes("dive")) synergy += 8;
    if (candidate.tags.includes("brawl") && ally.tags.includes("brawl")) synergy += 8;
    if (candidate.tags.includes("poke") && ally.tags.includes("poke")) synergy += 8;
  });

  if (teamStyle !== "mixed" && candidate.tags.includes(teamStyle)) synergy += 10;
  if (candidate.maps.includes(selectedMap)) map += 18;
  if (selectedMap === "Watchpoint: Gibraltar" && candidate.tags.includes("vertical")) map += 8;
  if (["King's Row", "Lijiang Tower", "Eichenwalde"].includes(selectedMap) && candidate.tags.includes("brawl")) map += 8;
  if (["Circuit Royal", "Route 66", "Rialto"].includes(selectedMap) && candidate.tags.includes("poke")) map += 8;
  if (["Ilios", "Nepal", "Hollywood"].includes(selectedMap) && candidate.tags.includes("dive")) map += 6;

  if (counter > 0) reasons.push(`Counters ${enemyHeroes.map((h) => h.name).slice(0, 2).join(" and ") || "key enemy threats"}`);
  if (synergy > 0) reasons.push(`Fits your ${teamStyle === "mixed" ? "current mixed" : teamStyle} style`);
  if (map > 0) reasons.push(`Map profile is strong on ${selectedMap}`);
  if (comfort >= 8) reasons.push("High comfort pick");
  if (meta > 0) reasons.push(`Current meta/rank bump for ${selectedMode} ${selectedRank}`);
  reasons.push(...subRoleResult.reasons);

  const total = Math.round(
    counter * scoreWeights.counter +
      synergy * scoreWeights.synergy +
      map * scoreWeights.map +
      comfort * 10 * scoreWeights.comfort +
      meta * 10 * scoreWeights.meta +
      subRole * 10 * scoreWeights.subRole,
  );

  return { hero: candidate, total, counter, synergy, map, comfort, meta, subRole, reasons };
}

export function rankRecommendations(
  candidates: ResolvedHero[],
  alliedHeroes: ResolvedHero[],
  enemyHeroes: ResolvedHero[],
  selectedMap: string,
  selectedRank: Rank,
  selectedMode: Mode,
  favoriteHeroIds: string[],
  recentHeroIds: string[],
) {
  return candidates
    .map((hero) => {
      const base = scoreHero(hero, alliedHeroes, enemyHeroes, selectedMap, selectedRank, selectedMode);
      const favoriteBoost = favoriteHeroIds.includes(hero.id) ? 4 : 0;
      const recentBoost = recentHeroIds.includes(hero.id) ? 2 : 0;

      return {
        ...base,
        total: base.total + favoriteBoost + recentBoost,
        reasons:
          favoriteBoost > 0 || recentBoost > 0
            ? [...base.reasons, favoriteBoost > 0 ? "Favorite hero bonus" : "Recent comfort bonus"]
            : base.reasons,
      };
    })
    .sort((a, b) => b.total - a.total);
}
