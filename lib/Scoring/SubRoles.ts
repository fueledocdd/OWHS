import type { Mode, ResolvedHero } from "@/lib/types";

export function getSubRoleModifier(
  candidate: ResolvedHero,
  alliedHeroes: ResolvedHero[],
  enemyHeroes: ResolvedHero[],
  selectedMode: Mode,
) {
  let score = 0;
  const reasons: string[] = [];

  const allySubRoles = alliedHeroes.map((hero) => hero.subRole);
  const enemySubRoles = enemyHeroes.map((hero) => hero.subRole);

  if (candidate.subRole === "Initiator" && enemySubRoles.includes("Sharpshooter")) {
    score += 2;
    reasons.push("Initiator pressure helps contest enemy backline angles");
  }

  if (candidate.subRole === "Flanker" && (enemySubRoles.includes("Tactician") || enemySubRoles.includes("Sharpshooter"))) {
    score += 2;
    reasons.push("Flanker profile pressures vulnerable backline targets");
  }

  if (candidate.subRole === "Stalwart" && selectedMode === "Competitive") {
    score += 1;
    reasons.push("Stalwart profile adds stability in sustained fights");
  }

  if (candidate.subRole === "Medic" && allySubRoles.includes("Bruiser")) {
    score += 1;
    reasons.push("Medic sustain complements frontline bruisers");
  }

  if (candidate.subRole === "Tactician" && allySubRoles.includes("Initiator")) {
    score += 1;
    reasons.push("Tactician utility pairs well with initiating tanks");
  }

  if (candidate.subRole === "Recon" && (enemySubRoles.includes("Stalwart") || enemySubRoles.includes("Specialist"))) {
    score += 1;
    reasons.push("Recon mobility helps create pressure around slower setups");
  }

  return { score, reasons };
}
