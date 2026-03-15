export type ComfortLabel = "Main" | "Comfortable" | "Can play" | "Default" | "Avoid";

export type UserHeroPreference = {
  heroId: string;
  comfort: number;
  label: ComfortLabel;
};

export type UserProfile = {
  heroPreferences: UserHeroPreference[];
};
