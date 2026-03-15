import type { BanRecommendation, ResolvedHero } from "@/lib/types";

const metaBanPressure: Record<string, number> = {
  sombra: 8,
  zarya: 7,
  tracer: 6,
  ana: 5,
  reaper: 5,
  bastion: 5,
  pharah: 4,
  widowmaker: 4,
};

export function getBanRecommendations(args: {
  preferredHeroId?: string;
  alliedHeroes: ResolvedHero[];
  availableHeroes: ResolvedHero[];
  userComfortByHeroId?: Record<string, number>;
}) {
  const { preferredHeroId, alliedHeroes, availableHeroes, userComfortByHeroId } = args;

  const preferredHero = availableHeroes.find((hero) => hero.id === preferredHeroId);
  const alliedStyleTags = new Set(alliedHeroes.flatMap((hero) => hero.tags));

  const scored: BanRecommendation[] = availableHeroes.map((hero) => {
    let score = 0;
    const reasons: string[] = [];

    const meta = metaBanPressure[hero.id] ?? 0;
    if (meta > 0) {
      score += meta;
      reasons.push("High current comp ban pressure");
    }

    if (preferredHero) {
      const countersPreferred = hero.strongInto.includes(preferredHero.name) || hero.strongInto.includes(preferredHero.id);
      if (countersPreferred) {
        score += 8;
        reasons.push(`Protects your likely ${preferredHero.name} pick`);
      }
    }

    if (alliedStyleTags.has("dive") && (hero.tags.includes("anti-dive") || hero.tags.includes("beam") || hero.name === "Brigitte")) {
      score += 5;
      reasons.push("Helps protect a dive-oriented plan");
    }

    if (alliedStyleTags.has("brawl") && (hero.name === "Pharah" || hero.name === "Widowmaker" || hero.tags.includes("poke"))) {
      score += 4;
      reasons.push("Removes long-range pressure into brawl setups");
    }

    if (preferredHeroId && userComfortByHeroId?.[preferredHeroId] && (userComfortByHeroId[preferredHeroId] ?? 0) >= 8) {
      if (preferredHero && (hero.strongInto.includes(preferredHero.name) || hero.strongInto.includes(preferredHero.id))) {
        score += 3;
        reasons.push("Supports one of your strongest comfort picks");
      }
    }

    return {
      heroId: hero.id,
      score,
      reasons,
    };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
