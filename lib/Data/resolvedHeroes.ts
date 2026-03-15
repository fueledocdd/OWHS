import type { ResolvedHero } from "@/lib/types";
import { heroes, getHeroById } from "@/lib/data/heroes";
import { getHeroProfileById } from "@/lib/data/heroProfiles";

export function getResolvedHero(heroId: string): ResolvedHero | null {
  const hero = getHeroById(heroId);
  const profile = getHeroProfileById(heroId);

  if (!hero || !profile) return null;

  return {
    ...hero,
    ...profile,
  };
}

export const resolvedHeroes: ResolvedHero[] = heroes
  .map((hero) => getResolvedHero(hero.id))
  .filter(Boolean) as ResolvedHero[];
