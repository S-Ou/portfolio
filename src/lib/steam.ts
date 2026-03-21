const STEAM_API_BASE = "https://api.steampowered.com";
const CACHE_TTL_MS = 15 * 60 * 1000;
const RECENT_GAMES_COUNT = 2;
const TOTAL_GAMES_COUNT = 5;

type SteamOwnedGame = {
  appid: number;
  name?: string;
  playtime_forever: number;
};

type SteamRecentlyPlayedResponse = {
  response: {
    games?: SteamOwnedGame[];
  };
};

type SteamOwnedGamesResponse = {
  response: {
    games?: SteamOwnedGame[];
  };
};

type SteamPlayerAchievement = {
  achieved: 0 | 1 | boolean;
};

type SteamPlayerStatsResponse = {
  playerstats?: {
    success?: boolean;
    achievements?: SteamPlayerAchievement[];
  };
};

type SteamSchemaResponse = {
  game?: {
    availableGameStats?: {
      achievements?: Array<{
        name: string;
      }>;
    };
  };
};

type SteamAppDetailsResponse = Record<
  string,
  {
    success: boolean;
    data?: {
      header_image?: string;
    };
  }
>;

type CacheEntry = {
  games: SteamWidgetGame[];
  expiresAt: number;
};

export type SteamWidgetGame = {
  appId: number;
  name: string;
  playtimeMinutes: number;
  unlockedAchievementCount: number | null;
  totalAchievementCount: number | null;
  headerImageUrl: string;
};

const steamGamesCache = new Map<string, CacheEntry>();

function buildSteamApiUrl(path: string, query: Record<string, string>): string {
  const url = new URL(`${STEAM_API_BASE}${path}`);

  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

function buildFallbackGameHeaderImageUrl(appId: number): string {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
}

async function getStoreHeaderImageUrl(appId: number): Promise<string> {
  const url = new URL("https://store.steampowered.com/api/appdetails");
  url.searchParams.set("appids", `${appId}`);

  try {
    const data = await fetchJson<SteamAppDetailsResponse>(url.toString());
    const appData = data[`${appId}`];

    if (!appData?.success || !appData.data?.header_image) {
      return buildFallbackGameHeaderImageUrl(appId);
    }

    return appData.data.header_image;
  } catch {
    return buildFallbackGameHeaderImageUrl(appId);
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Steam API request failed (${response.status}): ${message}`,
    );
  }

  return (await response.json()) as T;
}

async function getRecentlyPlayedGames({
  apiKey,
  steamId,
}: {
  apiKey: string;
  steamId: string;
}): Promise<SteamOwnedGame[]> {
  const url = buildSteamApiUrl(
    "/IPlayerService/GetRecentlyPlayedGames/v0001/",
    {
      key: apiKey,
      steamid: steamId,
      format: "json",
      count: `${RECENT_GAMES_COUNT}`,
    },
  );

  const data = await fetchJson<SteamRecentlyPlayedResponse>(url);
  return data.response.games ?? [];
}

async function getOwnedGames({
  apiKey,
  steamId,
}: {
  apiKey: string;
  steamId: string;
}): Promise<SteamOwnedGame[]> {
  const url = buildSteamApiUrl("/IPlayerService/GetOwnedGames/v0001/", {
    key: apiKey,
    steamid: steamId,
    format: "json",
    include_appinfo: "1",
    include_played_free_games: "1",
  });

  const data = await fetchJson<SteamOwnedGamesResponse>(url);
  return data.response.games ?? [];
}

async function getUnlockedAchievementCount({
  apiKey,
  steamId,
  appId,
}: {
  apiKey: string;
  steamId: string;
  appId: number;
}): Promise<number | null> {
  const url = buildSteamApiUrl("/ISteamUserStats/GetPlayerAchievements/v1/", {
    key: apiKey,
    steamid: steamId,
    appid: `${appId}`,
  });

  try {
    const data = await fetchJson<SteamPlayerStatsResponse>(url);

    if (!data.playerstats) {
      return null;
    }

    if (!data.playerstats.achievements) {
      return 0;
    }

    const unlockedCount = data.playerstats.achievements.reduce(
      (count, achievement) => {
        return (
          count +
          (achievement.achieved === 1 || achievement.achieved === true ? 1 : 0)
        );
      },
      0,
    );

    return unlockedCount;
  } catch {
    return null;
  }
}

async function getTotalAchievementCount({
  apiKey,
  appId,
}: {
  apiKey: string;
  appId: number;
}): Promise<number | null> {
  const url = buildSteamApiUrl("/ISteamUserStats/GetSchemaForGame/v2/", {
    key: apiKey,
    appid: `${appId}`,
  });

  try {
    const data = await fetchJson<SteamSchemaResponse>(url);
    const achievements = data.game?.availableGameStats?.achievements;

    if (!achievements) {
      return 0;
    }

    return achievements.length;
  } catch {
    return null;
  }
}

async function getAchievementProgress({
  apiKey,
  steamId,
  appId,
}: {
  apiKey: string;
  steamId: string;
  appId: number;
}): Promise<{ unlocked: number | null; total: number | null }> {
  const [unlocked, total] = await Promise.all([
    getUnlockedAchievementCount({
      apiKey,
      steamId,
      appId,
    }),
    getTotalAchievementCount({
      apiKey,
      appId,
    }),
  ]);

  return {
    unlocked,
    total,
  };
}

function selectGames(
  recentGames: SteamOwnedGame[],
  ownedGames: SteamOwnedGame[],
): SteamOwnedGame[] {
  const dedupedRecent: SteamOwnedGame[] = [];
  const recentIds = new Set<number>();

  for (const game of recentGames) {
    if (recentIds.has(game.appid)) {
      continue;
    }

    dedupedRecent.push(game);
    recentIds.add(game.appid);

    if (dedupedRecent.length === RECENT_GAMES_COUNT) {
      break;
    }
  }

  const topPlayedWithoutRecent = ownedGames
    .filter((game) => !recentIds.has(game.appid))
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, TOTAL_GAMES_COUNT - dedupedRecent.length);

  return [...dedupedRecent, ...topPlayedWithoutRecent];
}

function toWidgetGame(game: SteamOwnedGame): SteamWidgetGame {
  return {
    appId: game.appid,
    name: game.name?.trim() || `App ${game.appid}`,
    playtimeMinutes: game.playtime_forever,
    unlockedAchievementCount: null,
    totalAchievementCount: null,
    headerImageUrl: buildFallbackGameHeaderImageUrl(game.appid),
  };
}

export async function getSteamWidgetGames({
  apiKey,
  steamId,
  forceRefresh = false,
}: {
  apiKey: string;
  steamId: string;
  forceRefresh?: boolean;
}): Promise<{ games: SteamWidgetGame[]; fromCache: boolean }> {
  const now = Date.now();
  const cacheKey = steamId;
  const cached = steamGamesCache.get(cacheKey);

  if (!forceRefresh && cached && cached.expiresAt > now) {
    return {
      games: cached.games,
      fromCache: true,
    };
  }

  const [recentGames, ownedGames] = await Promise.all([
    getRecentlyPlayedGames({ apiKey, steamId }),
    getOwnedGames({ apiKey, steamId }),
  ]);

  const selectedGames = selectGames(recentGames, ownedGames);

  if (selectedGames.length === 0) {
    throw new Error("No Steam games found for this account.");
  }

  const gamesWithAchievementCounts = await Promise.all(
    selectedGames.map(async (game) => {
      const [achievementProgress, headerImageUrl] = await Promise.all([
        getAchievementProgress({
          apiKey,
          steamId,
          appId: game.appid,
        }),
        getStoreHeaderImageUrl(game.appid),
      ]);

      return {
        ...toWidgetGame(game),
        unlockedAchievementCount: achievementProgress.unlocked,
        totalAchievementCount: achievementProgress.total,
        headerImageUrl,
      };
    }),
  );

  steamGamesCache.set(cacheKey, {
    games: gamesWithAchievementCounts,
    expiresAt: now + CACHE_TTL_MS,
  });

  return {
    games: gamesWithAchievementCounts,
    fromCache: false,
  };
}
