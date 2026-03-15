export type BanPhaseState = {
  bannedHeroIds: string[];
  preferredHeroId?: string;
};

export type BanRecommendation = {
  heroId: string;
  score: number;
  reasons: string[];
};
