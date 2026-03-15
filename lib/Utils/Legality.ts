import type { MatchFormat } from "@/lib/types";
import type { BanPhaseState } from "@/lib/types/bans";
import { resolvedHeroes } from "@/lib/data/resolvedHeroes";

export function isHeroAvailableInFormat(heroId: string, matchFormat: MatchFormat) {
  const hero = resolvedHeroes.find((item) => item.id === heroId);
  if (!hero) return false;

  // V1 placeholder rule: all heroes are valid in standard modes;
  // Stadium-specific availability should later come from dedicated availability data.
  if (matchFormat === "stadium") {
    return true;
  }

  return true;
}

export function isHeroPlayable(args: {
  heroId: string;
  matchFormat: MatchFormat;
  banPhase: BanPhaseState;
  selectedHeroIds?: string[];
}) {
  const { heroId, matchFormat, banPhase, selectedHeroIds = [] } = args;

  if (!isHeroAvailableInFormat(heroId, matchFormat)) return false;
  if (banPhase.bannedHeroIds.includes(heroId)) return false;
  if (selectedHeroIds.includes(heroId)) return false;

  return true;
}
