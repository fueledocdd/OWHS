export type Role = "Tank" | "DPS" | "Support";
export type Mode = "Competitive" | "Quick Play" | "Stadium" | "Open Queue";
export type Rank = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "Master" | "GM";
export type TeamStyle = "brawl" | "dive" | "poke" | "mixed";
export type MatchFormat = "5v5" | "6v6" | "stadium";

export type TankSubRole = "Bruiser" | "Initiator" | "Stalwart";
export type DamageSubRole = "Flanker" | "Recon" | "Sharpshooter" | "Specialist";
export type SupportSubRole = "Tactician" | "Medic" | "Survivor";
export type HeroSubRole = TankSubRole | DamageSubRole | SupportSubRole;

export type Hero = {
  id: string;
  name: string;
  role: Role;
  subRole: HeroSubRole;
};

export type HeroProfile = {
  heroId: string;
  tags: string[];
  strongInto: string[];
  goodWith: string[];
  maps: string[];
  comfort?: number;
  difficulty?: number;
};

export type ResolvedHero = Hero & HeroProfile;

export type Recommendation = {
  hero: ResolvedHero;
  total: number;
  counter: number;
  synergy: number;
  map: number;
  comfort: number;
  meta: number;
  subRole: number;
  reasons: string[];
};

export type MatchState = {
  matchFormat: MatchFormat;
  selectedRole: Role;
  selectedMode: Mode;
  selectedMap: string;
  selectedRank: Rank;
  team: (ResolvedHero | null)[];
  enemy: (ResolvedHero | null)[];
  favoriteHeroIds: string[];
  recentHeroIds: string[];
};
