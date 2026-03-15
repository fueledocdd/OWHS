import type { MatchFormat } from "@/lib/types";
import type { BanPhaseState } from "@/lib/types/bans";
import { resolvedHeroes } from "@/lib/data/resolvedHeroes";

// Source of truth should eventually be generated from Blizzard's official Stadium hero list.
// For now, keep it explicit so the app does not silently assume every future hero is legal.
const stadiumHeroIds = new Set([
  "ana",
  "anran",
  "ashe",
  "baptiste",
  "bastion",
  "brigitte",
  "cassidy",
  "domina",
  "doomfist",
  "dva",
  "echo",
  "emre",
  "freja",
  "genji",
  "hanzo",
  "hazard",
  "illari",
  "junkerqueen",
  "junkrat",
  "jetpackcat",
  "juno",
  "kiriko",
  "lifeweaver",
  "lucio",
  "mauga",
  "mei",
  "mercy",
  "mizuki",
  "moira",
  "orisa",
  "pharah",
  "ramattra",
  "reaper",
  "reinhardt",
  "roadhog",
  "sigma",
  "sojourn",
  "soldier76",
  "sombra",
  "symmetra",
  "torbjorn",
  "tracer",
  "vendetta",
  "venture",
  "widowmaker",
  "winston",
  "wreckingball",
  "wuyang",
  "zarya",
  "zenyatta",
]);

export function isHeroAvailableInFormat(heroId: string, matchFormat: MatchFormat) {
  const hero = resolvedHeroes.find((item) => item.id === heroId);
  if (!hero) return false;

  if (matchFormat === "stadium") {
    return stadiumHeroIds.has(heroId);
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
