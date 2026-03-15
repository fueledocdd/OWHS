import type { MatchFormat, Mode, Rank, Role } from "@/lib/types";

export const roles: Role[] = ["Tank", "DPS", "Support"];
export const modes: Mode[] = ["Competitive", "Quick Play", "Stadium", "Open Queue"];
export const ranks: Rank[] = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "GM"];
export const STORAGE_KEY = "ow-hero-picker-v1";

export type MapModeType =
  | "Control"
  | "Escort"
  | "Hybrid"
  | "Push"
  | "Flashpoint"
  | "Clash"
  | "Payload Race";

export type MapDefinition = {
  id: string;
  name: string;
  modeType: MapModeType;
  supportedFormats: MatchFormat[];
  tags: string[];
  stadiumOnly?: boolean;
};

export const mapDefinitions: MapDefinition[] = [
  { id: "busan", name: "Busan", modeType: "Control", supportedFormats: ["5v5", "6v6"], tags: ["control", "mixed"] },
  { id: "ilios", name: "Ilios", modeType: "Control", supportedFormats: ["5v5", "6v6"], tags: ["control", "boop", "verticality"] },
  { id: "lijiang", name: "Lijiang Tower", modeType: "Control", supportedFormats: ["5v5", "6v6"], tags: ["control", "brawl"] },
  { id: "nepal", name: "Nepal", modeType: "Control", supportedFormats: ["5v5", "6v6"], tags: ["control", "verticality"] },
  { id: "oasis", name: "Oasis", modeType: "Control", supportedFormats: ["5v5", "6v6"], tags: ["control", "open"] },
  { id: "samoa", name: "Samoa", modeType: "Control", supportedFormats: ["5v5", "6v6"], tags: ["control", "mixed"] },

  { id: "circuit-royal", name: "Circuit Royal", modeType: "Escort", supportedFormats: ["5v5", "6v6"], tags: ["long-sightlines", "poke"] },
  { id: "dorado", name: "Dorado", modeType: "Escort", supportedFormats: ["5v5", "6v6"], tags: ["verticality", "mixed"] },
  { id: "havana", name: "Havana", modeType: "Escort", supportedFormats: ["5v5", "6v6"], tags: ["long-sightlines", "poke"] },
  { id: "junkertown", name: "Junkertown", modeType: "Escort", supportedFormats: ["5v5", "6v6"], tags: ["long-sightlines", "poke"] },
  { id: "rialto", name: "Rialto", modeType: "Escort", supportedFormats: ["5v5", "6v6"], tags: ["mixed", "angles"] },
  { id: "route-66", name: "Route 66", modeType: "Escort", supportedFormats: ["5v5", "6v6"], tags: ["mixed", "poke"] },
  { id: "shambali", name: "Shambali Monastery", modeType: "Escort", supportedFormats: ["5v5", "6v6"], tags: ["verticality", "escort"] },
  { id: "gibraltar", name: "Watchpoint: Gibraltar", modeType: "Escort", supportedFormats: ["5v5", "6v6"], tags: ["verticality", "dive"] },
  { id: "aatlis", name: "Aatlis", modeType: "Escort", supportedFormats: ["5v5", "6v6"], tags: ["escort", "mixed"] },

  { id: "blizzard-world", name: "Blizzard World", modeType: "Hybrid", supportedFormats: ["5v5", "6v6"], tags: ["hybrid", "mixed"] },
  { id: "eichenwalde", name: "Eichenwalde", modeType: "Hybrid", supportedFormats: ["5v5", "6v6"], tags: ["brawl", "hybrid"] },
  { id: "hollywood", name: "Hollywood", modeType: "Hybrid", supportedFormats: ["5v5", "6v6"], tags: ["mixed", "hybrid"] },
  { id: "kings-row", name: "King's Row", modeType: "Hybrid", supportedFormats: ["5v5", "6v6"], tags: ["brawl", "hybrid"] },
  { id: "midtown", name: "Midtown", modeType: "Hybrid", supportedFormats: ["5v5", "6v6"], tags: ["mixed", "hybrid"] },
  { id: "numbani", name: "Numbani", modeType: "Hybrid", supportedFormats: ["5v5", "6v6"], tags: ["verticality", "hybrid"] },
  { id: "paraiso", name: "Paraíso", modeType: "Hybrid", supportedFormats: ["5v5", "6v6"], tags: ["mixed", "hybrid"] },

  { id: "colosseo", name: "Colosseo", modeType: "Push", supportedFormats: ["5v5", "6v6"], tags: ["push", "long-lanes"] },
  { id: "esperanca", name: "Esperança", modeType: "Push", supportedFormats: ["5v5", "6v6"], tags: ["push", "flanks"] },
  { id: "new-queen-street", name: "New Queen Street", modeType: "Push", supportedFormats: ["5v5", "6v6"], tags: ["push", "brawl"] },
  { id: "runasapi", name: "Runasapi", modeType: "Push", supportedFormats: ["5v5", "6v6"], tags: ["push", "mixed"] },

  { id: "new-junk-city", name: "New Junk City", modeType: "Flashpoint", supportedFormats: ["5v5", "6v6"], tags: ["flashpoint", "large"] },
  { id: "suravasa", name: "Suravasa", modeType: "Flashpoint", supportedFormats: ["5v5", "6v6"], tags: ["flashpoint", "large"] },

  { id: "hanaoka", name: "Hanaoka", modeType: "Clash", supportedFormats: ["5v5", "6v6"], tags: ["clash", "brawl"] },
  { id: "throne-of-anubis", name: "Throne of Anubis", modeType: "Clash", supportedFormats: ["5v5", "6v6"], tags: ["clash", "mixed"] },

  { id: "wuxing-university", name: "Wuxing University", modeType: "Payload Race", supportedFormats: ["stadium"], tags: ["stadium", "payload-race"], stadiumOnly: true },
  { id: "powder-keg-mine", name: "Powder Keg Mine", modeType: "Payload Race", supportedFormats: ["stadium"], tags: ["stadium", "payload-race"], stadiumOnly: true },
];

export const maps = mapDefinitions.map((map) => map.name);

export function getMapsForFormat(matchFormat: MatchFormat) {
  return mapDefinitions.filter((map) => map.supportedFormats.includes(matchFormat));
}
