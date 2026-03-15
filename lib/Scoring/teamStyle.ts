import type { ResolvedHero, TeamStyle } from "@/lib/types";

export function inferTeamStyle(alliedHeroes: ResolvedHero[]): TeamStyle {
  if (alliedHeroes.length === 0) return "mixed";

  const counts = { brawl: 0, dive: 0, poke: 0 };

  alliedHeroes.forEach((hero) => {
    if (hero.tags.includes("brawl")) counts.brawl += 1;
    if (hero.tags.includes("dive")) counts.dive += 1;
    if (hero.tags.includes("poke")) counts.poke += 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (sorted[0][1] === 0) return "mixed";
  if (sorted[0][1] === sorted[1][1]) return "mixed";

  return sorted[0][0] as TeamStyle;
}
