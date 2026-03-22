export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonValue[];

export type JsonObject = {
  [key: string]: JsonValue;
};

export type HeroAggregate = {
  heroId: number | null;
  name: string;
  matches: number;
  playTimeSeconds: number;
  imageUrl: string | null;
};

export type HeroCatalogEntry = {
  id: string;
  name: string;
  imageUrl: string | null;
  role: string | null;
  real_name: string | null;
  transformations: Array<{
    id: string;
    name: string | null;
    icon: string | null;
  }>;
};

export type MarvelRivalsHero = {
  name: string;
  timePlayedHours: number;
  imageUrl: string | null;
};

export type SeasonSnapshot = {
  playerName: string;
  seasonResponseNumber: number | null;
  rank: string | null;
  matchesPlayed: number;
  wins: number;
  kos: number;
  assists: number;
  timePlayedSeconds: number;
  heroes: HeroAggregate[];
  fallbackHeroImageUrl: string | null;
};

export type CurrentSeasonCacheEntry = {
  data: SeasonSnapshot;
  expiresAt: number;
};

export type MarvelRivalsWidgetStats = {
  playerName: string;
  seasonRank: string | null;
  seasonLabel: string | null;
  heroes: MarvelRivalsHero[];
  highestRank: string | null;
  timePlayedHours: number | null;
  matchesPlayed: number | null;
  wins: number | null;
  kos: number | null;
  assists: number | null;
  heroImageUrl: string | null;
  fetchedAt: string;
};

export type MarvelRivalsBackfillProgress = {
  totalHistoricalSeasons: number;
  cachedHistoricalSeasons: number;
  remainingHistoricalSeasons: number;
  percent: number;
  isComplete: boolean;
  nextBackfillAttemptInSeconds: number | null;
};

export type MarvelRivalsSeasonInfo = {
  responseSeason: number;
  apiSeason: number;
  label: string;
  isCurrent: boolean;
};
