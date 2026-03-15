import type { Mode, Rank, ResolvedHero } from "@/lib/types";

export function getMetaModifier(hero: ResolvedHero, rank: Rank, mode: Mode) {
  let value = 0;

  if (mode === "Stadium" && hero.tags.includes("brawl")) value += 4;
  if (["Master", "GM"].includes(rank) && hero.tags.includes("dive")) value += 4;
  if (["Bronze", "Silver"].includes(rank) && hero.name === "Soldier: 76") value += 4;
  if (hero.name === "Kiriko" || hero.name === "Sigma") value += 3;

  return value;
}
