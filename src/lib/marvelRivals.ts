import { buildCacheKey, getJsonValue, setJsonValue } from "@/lib/redisCache";
import type {
  CurrentSeasonCacheEntry,
  HeroAggregate,
  HeroCatalogEntry,
  JsonObject,
  JsonValue,
  MarvelRivalsBackfillProgress,
  MarvelRivalsSeasonInfo,
  MarvelRivalsWidgetStats,
  SeasonSnapshot,
} from "@/lib/marvelRivals.types";

export type {
  CurrentSeasonCacheEntry,
  HeroAggregate,
  HeroCatalogEntry,
  JsonObject,
  JsonValue,
  MarvelRivalsBackfillProgress,
  MarvelRivalsSeasonInfo,
  MarvelRivalsWidgetStats,
  SeasonSnapshot,
} from "@/lib/marvelRivals.types";

const MARVEL_RIVALS_API_BASE = "https://marvelrivalsapi.com/api";
const MARVEL_RIVALS_IMAGE_BASE = "https://marvelrivalsapi.com/rivals";
const CURRENT_SEASON_TTL_MS = 4 * 60 * 60 * 1000;
const MAX_FETCH_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 2_000;
const MAX_HISTORICAL_FETCHES_PER_REQUEST = 2;
const HISTORICAL_BACKFILL_COOLDOWN_MS = 60_000;

class MarvelRivalsApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const seasonMapping: Record<number, [number, string]> = {
  // Key = season number in API response.
  // Value = [season number used in API query, season label displayed in game].
  0: [0, "0"],
  1: [1, "1.0"],
  2: [1.5, "1.5"],
  3: [2, "2.0"],
  4: [2.5, "2.5"],
  5: [3, "3.0"],
  6: [3.5, "3.5"],
  7: [4, "4.0"],
  8: [4.5, "4.5"],
  9: [5, "5.0"],
  10: [5.5, "5.5"],
  11: [6, "6.0"],
  12: [6.5, "6.5"],
  13: [7, "7.0"],
  14: [7.5, "7.5"],
  15: [8, "8.0"],
  16: [8.5, "8.5"],
  17: [9, "9.0"],
  18: [9.5, "9.5"],
  19: [10, "10.0"],
  20: [10.5, "10.5"],
  21: [11, "11.0"],
  22: [11.5, "11.5"],
  23: [12, "12.0"],
  24: [12.5, "12.5"],
  25: [13, "13.0"],
  26: [13.5, "13.5"],
  27: [14, "14.0"],
  28: [14.5, "14.5"],
  29: [15, "15.0"],
  30: [15.5, "15.5"],
};

const currentSeasonCache = new Map<string, CurrentSeasonCacheEntry>();
const historicalSeasonCache = new Map<string, SeasonSnapshot>();
const historicalBackfillCooldownByPlayer = new Map<string, number>();
const heroCatalogCacheById = new Map<number, HeroCatalogEntry>();

function getCurrentSeasonRedisKey(playerUid: string): string {
  return buildCacheKey(`current:${playerUid.toLowerCase()}`);
}

function getCurrentSeasonLatestRedisKey(playerUid: string): string {
  return buildCacheKey(`season-current:${playerUid.toLowerCase()}`);
}

function getHistoricalSeasonRedisKey(
  playerUid: string,
  apiSeason: number,
): string {
  return buildCacheKey(`season:${playerUid.toLowerCase()}:${apiSeason}`);
}

function getCooldownRedisKey(playerUid: string): string {
  return buildCacheKey(`cooldown:${playerUid.toLowerCase()}`);
}

function getHeroRedisKey(heroId: number): string {
  return buildCacheKey(`hero:${heroId}`);
}

async function getCurrentSeasonCacheEntry(
  playerUid: string,
): Promise<CurrentSeasonCacheEntry | null> {
  const key = playerUid.toLowerCase();
  const inMemory = currentSeasonCache.get(key);

  if (inMemory) {
    return inMemory;
  }

  const fromRedis = await getJsonValue<CurrentSeasonCacheEntry>(
    getCurrentSeasonRedisKey(playerUid),
  );

  if (fromRedis) {
    currentSeasonCache.set(key, fromRedis);
    return fromRedis;
  }

  return null;
}

async function setCurrentSeasonCacheEntry({
  playerUid,
  entry,
}: {
  playerUid: string;
  entry: CurrentSeasonCacheEntry;
}): Promise<void> {
  const key = playerUid.toLowerCase();
  currentSeasonCache.set(key, entry);

  await setJsonValue(
    getCurrentSeasonRedisKey(playerUid),
    entry,
    Math.round(CURRENT_SEASON_TTL_MS / 1000),
  );

  await setJsonValue(getCurrentSeasonLatestRedisKey(playerUid), entry.data);
}

async function getHistoricalSeasonSnapshot({
  playerUid,
  apiSeason,
}: {
  playerUid: string;
  apiSeason: number;
}): Promise<SeasonSnapshot | null> {
  const key = getSeasonCacheKey(playerUid, apiSeason);
  const inMemory = historicalSeasonCache.get(key);
  if (inMemory) {
    return inMemory;
  }

  const fromRedis = await getJsonValue<SeasonSnapshot>(
    getHistoricalSeasonRedisKey(playerUid, apiSeason),
  );

  if (fromRedis) {
    historicalSeasonCache.set(key, fromRedis);
    return fromRedis;
  }

  return null;
}

async function setHistoricalSeasonSnapshot({
  playerUid,
  apiSeason,
  snapshot,
}: {
  playerUid: string;
  apiSeason: number;
  snapshot: SeasonSnapshot;
}): Promise<void> {
  const key = getSeasonCacheKey(playerUid, apiSeason);
  historicalSeasonCache.set(key, snapshot);
  await setJsonValue(
    getHistoricalSeasonRedisKey(playerUid, apiSeason),
    snapshot,
  );
}

async function getHistoricalCooldownUntil(playerUid: string): Promise<number> {
  const key = playerUid.toLowerCase();
  const inMemory = historicalBackfillCooldownByPlayer.get(key);

  if (typeof inMemory === "number") {
    return inMemory;
  }

  const fromRedis = await getJsonValue<number>(getCooldownRedisKey(playerUid));
  if (typeof fromRedis === "number") {
    historicalBackfillCooldownByPlayer.set(key, fromRedis);
    return fromRedis;
  }

  return 0;
}

async function setHistoricalCooldownUntil({
  playerUid,
  cooldownUntil,
}: {
  playerUid: string;
  cooldownUntil: number;
}): Promise<void> {
  const key = playerUid.toLowerCase();
  historicalBackfillCooldownByPlayer.set(key, cooldownUntil);

  const ttlSeconds = Math.max(
    1,
    Math.ceil((cooldownUntil - Date.now()) / 1000),
  );
  await setJsonValue(getCooldownRedisKey(playerUid), cooldownUntil, ttlSeconds);
}

async function getHeroCatalogEntry(
  heroId: number,
): Promise<HeroCatalogEntry | null> {
  const inMemory = heroCatalogCacheById.get(heroId);
  if (inMemory) {
    return inMemory;
  }

  const fromRedis = await getJsonValue<HeroCatalogEntry>(
    getHeroRedisKey(heroId),
  );
  if (fromRedis) {
    heroCatalogCacheById.set(heroId, fromRedis);
    return fromRedis;
  }

  return null;
}

async function setHeroCatalogEntry(entry: HeroCatalogEntry): Promise<void> {
  const heroId = Number(entry.id);
  if (!Number.isFinite(heroId)) {
    return;
  }

  heroCatalogCacheById.set(heroId, entry);
  await setJsonValue(getHeroRedisKey(heroId), entry);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getRetryDelayMs(retryAfterHeader: string | null): number {
  if (!retryAfterHeader) {
    return DEFAULT_RETRY_DELAY_MS;
  }

  const seconds = Number(retryAfterHeader);
  if (Number.isFinite(seconds) && seconds > 0) {
    return Math.max(500, Math.round(seconds * 1000));
  }

  return DEFAULT_RETRY_DELAY_MS;
}

function isRecord(value: JsonValue | undefined): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeKey(value: string): string {
  return value.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function toAbsoluteRivalsImageUrl(value: string): string {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const normalizedPath = value.startsWith("/") ? value : `/${value}`;

  if (normalizedPath.startsWith("/rivals/")) {
    return `https://marvelrivalsapi.com${normalizedPath}`;
  }

  return `${MARVEL_RIVALS_IMAGE_BASE}${normalizedPath}`;
}

function toStringValue(value: JsonValue | undefined): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value}`;
  }

  return null;
}

function toNumberValue(value: JsonValue | undefined): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    if (!cleaned) {
      return null;
    }

    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toArrayValue(value: JsonValue | undefined): JsonValue[] {
  return Array.isArray(value) ? value : [];
}

function walkJson(
  value: JsonValue,
  visitor: (key: string, nodeValue: JsonValue) => void,
): void {
  if (!isRecord(value) && !Array.isArray(value)) {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      walkJson(item, visitor);
    }
    return;
  }

  for (const [key, nested] of Object.entries(value)) {
    visitor(key, nested);
    walkJson(nested, visitor);
  }
}

function findFirstStringByKeys(
  root: JsonValue,
  candidates: string[],
): string | null {
  const keySet = new Set(candidates.map(normalizeKey));
  let found: string | null = null;

  walkJson(root, (key, value) => {
    if (found) {
      return;
    }

    if (!keySet.has(normalizeKey(key))) {
      return;
    }

    if (typeof value === "string" && value.trim()) {
      found = value.trim();
      return;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      found = `${value}`;
      return;
    }

    if (isRecord(value) && typeof value.name === "string") {
      found = value.name.trim();
    }
  });

  return found;
}

function findHeroImageUrl(root: JsonValue): string | null {
  const imagePath = findFirstStringByKeys(root, [
    "heroImage",
    "heroImageUrl",
    "heroPortrait",
    "portrait",
    "topHeroImage",
    "image",
    "avatar",
  ]);

  if (!imagePath) {
    return null;
  }

  return toAbsoluteRivalsImageUrl(imagePath);
}

function getRootPayload(payload: JsonValue): JsonValue {
  if (isRecord(payload) && payload.data) {
    return payload.data;
  }

  return payload;
}

function parseSeasonNumberFromRankGameSeasonKey(rawKey: string): number | null {
  const match = rawKey.match(/(\d{2})$/);
  if (!match) {
    return null;
  }

  const season = Number(match[1]);
  return Number.isFinite(season) ? season : null;
}

function detectSeasonResponseNumber(root: JsonObject): number | null {
  const matchHistory = toArrayValue(root.match_history);
  let maxSeason: number | null = null;

  for (const item of matchHistory) {
    if (!isRecord(item)) {
      continue;
    }

    const season = toNumberValue(item.season);
    if (season === null) {
      continue;
    }

    if (maxSeason === null || season > maxSeason) {
      maxSeason = season;
    }
  }

  if (maxSeason !== null) {
    return maxSeason;
  }

  const player = isRecord(root.player) ? root.player : null;
  const info = player && isRecord(player.info) ? player.info : null;
  const rankGameSeason =
    info && isRecord(info.rank_game_season) ? info.rank_game_season : null;

  if (!rankGameSeason) {
    return null;
  }

  let maxFromKeys: number | null = null;

  for (const key of Object.keys(rankGameSeason)) {
    const season = parseSeasonNumberFromRankGameSeasonKey(key);
    if (season === null) {
      continue;
    }

    if (maxFromKeys === null || season > maxFromKeys) {
      maxFromKeys = season;
    }
  }

  return maxFromKeys;
}

function parseHeroRows(root: JsonObject): HeroAggregate[] {
  const collections = [
    ...toArrayValue(root.heroes_ranked),
    ...toArrayValue(root.heroes_unranked),
  ];

  const rows: HeroAggregate[] = [];

  for (const rawRow of collections) {
    if (!isRecord(rawRow)) {
      continue;
    }

    const name =
      toStringValue(rawRow.hero_name) ?? toStringValue(rawRow.heroName);
    if (!name) {
      continue;
    }

    const heroId =
      toNumberValue(rawRow.hero_id) ??
      toNumberValue(rawRow.id) ??
      toNumberValue(rawRow.heroId);

    const matches = toNumberValue(rawRow.matches) ?? 0;
    const playTimeSeconds = toNumberValue(rawRow.play_time) ?? 0;

    const rawImage =
      toStringValue(rawRow.hero_thumbnail) ?? toStringValue(rawRow.hero_image);

    rows.push({
      heroId,
      name,
      matches,
      playTimeSeconds,
      imageUrl: rawImage ? toAbsoluteRivalsImageUrl(rawImage) : null,
    });
  }

  return rows;
}

function parseSeasonSnapshot(
  payload: JsonValue,
  fallbackPlayerUid: string,
): SeasonSnapshot {
  const rootValue = getRootPayload(payload);
  const root = isRecord(rootValue) ? rootValue : ({} as JsonObject);

  const playerName =
    toStringValue(root.name) ??
    findFirstStringByKeys(rootValue, [
      "playerName",
      "name",
      "username",
      "ign",
    ]) ??
    fallbackPlayerUid;

  const player = isRecord(root.player) ? root.player : null;
  const rankObj = player && isRecord(player.rank) ? player.rank : null;
  const rank = toStringValue(rankObj?.rank);

  const overall = isRecord(root.overall_stats) ? root.overall_stats : null;
  const ranked = overall && isRecord(overall.ranked) ? overall.ranked : null;
  const unranked =
    overall && isRecord(overall.unranked) ? overall.unranked : null;

  const matchesPlayed = toNumberValue(overall?.total_matches) ?? 0;

  const wins =
    toNumberValue(overall?.total_wins) ??
    (isRecord(overall?.total_wins)
      ? (toNumberValue((overall.total_wins as JsonObject).wins) ?? 0)
      : 0);

  const rankedKos = toNumberValue(ranked?.total_kills) ?? 0;
  const unrankedKos = toNumberValue(unranked?.total_kills) ?? 0;
  const kos = rankedKos + unrankedKos;

  const rankedAssists = toNumberValue(ranked?.total_assists) ?? 0;
  const unrankedAssists = toNumberValue(unranked?.total_assists) ?? 0;
  const assists = rankedAssists + unrankedAssists;

  const rankedTimeRaw = toNumberValue(ranked?.total_time_played_raw);
  const unrankedTimeRaw = toNumberValue(unranked?.total_time_played_raw);

  let timePlayedSeconds = (rankedTimeRaw ?? 0) + (unrankedTimeRaw ?? 0);

  if (timePlayedSeconds <= 0) {
    const totalPlayTimeObj =
      overall && isRecord(overall.total_play_time)
        ? overall.total_play_time
        : null;
    timePlayedSeconds = toNumberValue(totalPlayTimeObj?.time_played) ?? 0;
  }

  return {
    playerName,
    seasonResponseNumber: detectSeasonResponseNumber(root),
    rank,
    matchesPlayed,
    wins,
    kos,
    assists,
    timePlayedSeconds,
    heroes: parseHeroRows(root),
    fallbackHeroImageUrl: findHeroImageUrl(rootValue),
  };
}

function getSeasonPairFromResponseSeason(
  seasonResponseNumber: number,
): [number, string] | null {
  const mapped = seasonMapping[seasonResponseNumber];
  if (mapped) {
    return mapped;
  }

  if (!Number.isInteger(seasonResponseNumber) || seasonResponseNumber < 0) {
    return null;
  }

  if (seasonResponseNumber === 0) {
    return [0, "0"];
  }

  const apiSeason = 1 + (seasonResponseNumber - 1) * 0.5;
  return [apiSeason, apiSeason.toFixed(1)];
}

function getDisplaySeasonLabel(seasonResponseNumber: number): string {
  const pair = getSeasonPairFromResponseSeason(seasonResponseNumber);
  return pair?.[1] ?? `${seasonResponseNumber}`;
}

function getApiSeasonFromResponseSeason(
  seasonResponseNumber: number,
): number | null {
  const pair = getSeasonPairFromResponseSeason(seasonResponseNumber);
  return pair?.[0] ?? null;
}

function getPreviousApiSeasons(currentSeasonResponseNumber: number): number[] {
  const apiSeasons = new Set<number>();

  for (let responseSeason = 0; responseSeason < currentSeasonResponseNumber; responseSeason += 1) {
    const apiSeason = getApiSeasonFromResponseSeason(responseSeason);
    if (apiSeason !== null) {
      apiSeasons.add(apiSeason);
    }
  }

  return Array.from(apiSeasons).sort((a, b) => a - b);
}

function isValidRank(rank: string | null): rank is string {
  if (!rank) {
    return false;
  }

  const normalized = rank.trim().toLowerCase();
  if (
    !normalized ||
    normalized === "invalid level" ||
    normalized === "unranked"
  ) {
    return false;
  }

  return true;
}

const rankBaseScore: Record<string, number> = {
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
  diamond: 5,
  grandmaster: 6,
  celestial: 7,
  eternity: 8,
  "one above all": 9,
};

const rankTierScore: Record<string, number> = {
  III: 1,
  II: 2,
  I: 3,
};

function rankToScore(rank: string): number {
  const normalized = rank.replace(/\s+/g, " ").trim();
  const match = normalized.match(
    /^(Bronze|Silver|Gold|Platinum|Diamond|Grandmaster|Celestial|Eternity|One Above All)(?:\s+(III|II|I))?$/i,
  );

  if (!match) {
    return -1;
  }

  const baseLabel = match[1].toLowerCase();
  const base = rankBaseScore[baseLabel] ?? -1;

  if (base < 0) {
    return -1;
  }

  const tierToken = (match[2] ?? "").toUpperCase();
  const tier = rankTierScore[tierToken] ?? 0;

  return base * 10 + tier;
}

function getSeasonCacheKey(playerUid: string, apiSeason: number): string {
  return `${playerUid.toLowerCase()}:${apiSeason}`;
}

async function fetchJsonWithRetry({
  url,
  apiKey,
}: {
  url: string;
  apiKey: string;
}): Promise<JsonValue> {
  for (let attempt = 0; attempt <= MAX_FETCH_RETRIES; attempt += 1) {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "x-api-key": apiKey,
      },
    });

    const rawText = await response.text();

    if (response.ok) {
      try {
        return JSON.parse(rawText) as JsonValue;
      } catch {
        throw new Error("Marvel Rivals API returned an invalid JSON response.");
      }
    }

    if (response.status === 429 && attempt < MAX_FETCH_RETRIES) {
      const retryDelayMs = getRetryDelayMs(response.headers.get("retry-after"));
      await sleep(retryDelayMs);
      continue;
    }

    throw new MarvelRivalsApiError(
      response.status,
      `Marvel Rivals API request failed (${response.status}): ${rawText.slice(0, 280)}`,
    );
  }

  throw new MarvelRivalsApiError(
    429,
    "Marvel Rivals API request failed (429): Too many requests.",
  );
}

function normalizeHeroCatalogEntry(
  payload: JsonValue,
): HeroCatalogEntry | null {
  if (!isRecord(payload)) {
    return null;
  }

  const heroId =
    toStringValue(payload.id) ??
    toStringValue(payload.hero_id) ??
    toStringValue(payload.heroId);

  const name =
    toStringValue(payload.hero_name) ??
    toStringValue(payload.name) ??
    toStringValue(payload.heroName);

  if (!heroId || !name) {
    return null;
  }

  const rawImage =
    toStringValue(payload.imageUrl) ??
    toStringValue(payload.hero_thumbnail) ??
    toStringValue(payload.thumbnail) ??
    toStringValue(payload.image);

  const role = toStringValue(payload.role);
  const real_name = toStringValue(payload.real_name);
  const transformations = toArrayValue(payload.transformations)
    .map((value) => {
      if (!isRecord(value)) {
        return null;
      }

      const id =
        toStringValue(value.id) ??
        toStringValue(value.transformation_id) ??
        toStringValue(value.transformationId);

      if (!id) {
        return null;
      }

      const name = toStringValue(value.name);
      const rawIcon = toStringValue(value.icon);

      return {
        id,
        name,
        icon: rawIcon ? toAbsoluteRivalsImageUrl(rawIcon) : null,
      };
    })
    .filter(
      (
        value,
      ): value is {
        id: string;
        name: string | null;
        icon: string | null;
      } => value !== null,
    );

  return {
    id: heroId,
    name,
    imageUrl: rawImage ? toAbsoluteRivalsImageUrl(rawImage) : null,
    role,
    real_name,
    transformations,
  };
}

async function fetchSingleHeroByQuery({
  apiKey,
  query,
}: {
  apiKey: string;
  query: string | number;
}): Promise<HeroCatalogEntry | null> {
  const encodedQuery = encodeURIComponent(`${query}`);
  const payload = await fetchJsonWithRetry({
    url: `${MARVEL_RIVALS_API_BASE}/v1/heroes/hero/${encodedQuery}`,
    apiKey,
  });

  const root = getRootPayload(payload);
  const entry = normalizeHeroCatalogEntry(root);
  if (entry) {
    return entry;
  }

  const fallbackName = findFirstStringByKeys(root, [
    "hero_name",
    "heroName",
    "name",
  ]);

  const fallbackId = findFirstStringByKeys(root, ["hero_id", "id", "heroId"]);
  const parsedId = fallbackId ? Number(fallbackId) : null;

  if (fallbackName && parsedId !== null && Number.isFinite(parsedId)) {
    return {
      id: `${parsedId}`,
      name: fallbackName,
      imageUrl: null,
      role: findFirstStringByKeys(root, ["role"]),
      real_name: findFirstStringByKeys(root, ["real_name", "realName"]),
      transformations: [],
    };
  }

  return null;
}

async function resolveHeroById({
  apiKey,
  heroId,
}: {
  apiKey: string;
  heroId: number;
}): Promise<HeroCatalogEntry | null> {
  const cached = await getHeroCatalogEntry(heroId);
  if (cached) {
    return cached;
  }

  try {
    const hero = await fetchSingleHeroByQuery({ apiKey, query: heroId });
    if (hero) {
      await setHeroCatalogEntry(hero);
      return hero;
    }
  } catch {
    return null;
  }

  return null;
}

async function fetchPlayerStatsPayload({
  apiKey,
  playerUid,
  season,
}: {
  apiKey: string;
  playerUid: string;
  season?: number;
}): Promise<JsonValue> {
  const encodedUid = encodeURIComponent(playerUid);
  const url = new URL(`${MARVEL_RIVALS_API_BASE}/v1/player/${encodedUid}`);

  if (typeof season === "number") {
    url.searchParams.set("season", `${season}`);
  }

  return fetchJsonWithRetry({
    url: url.toString(),
    apiKey,
  });
}

async function aggregateWidgetStats(
  snapshots: SeasonSnapshot[],
  apiKey: string,
  fallbackPlayerUid: string,
): Promise<MarvelRivalsWidgetStats> {
  const totals = {
    matchesPlayed: 0,
    wins: 0,
    kos: 0,
    assists: 0,
    timePlayedSeconds: 0,
  };

  let playerName: string | null = null;

  const heroTotals = new Map<
    string,
    {
      heroId: number | null;
      name: string;
      matches: number;
      playTimeSeconds: number;
      imageUrl: string | null;
    }
  >();

  let latestSeasonRank: { rank: string; season: number } | null = null;
  let highestRank: { rank: string; score: number } | null = null;
  let fallbackHeroImageUrl: string | null = null;

  for (const snapshot of snapshots) {
    if (!playerName && snapshot.playerName) {
      playerName = snapshot.playerName;
    }

    totals.matchesPlayed += snapshot.matchesPlayed;
    totals.wins += snapshot.wins;
    totals.kos += snapshot.kos;
    totals.assists += snapshot.assists;
    totals.timePlayedSeconds += snapshot.timePlayedSeconds;

    if (!fallbackHeroImageUrl && snapshot.fallbackHeroImageUrl) {
      fallbackHeroImageUrl = snapshot.fallbackHeroImageUrl;
    }

    if (snapshot.seasonResponseNumber !== null && isValidRank(snapshot.rank)) {
      if (
        !latestSeasonRank ||
        snapshot.seasonResponseNumber > latestSeasonRank.season
      ) {
        latestSeasonRank = {
          rank: snapshot.rank,
          season: snapshot.seasonResponseNumber,
        };
      }

      const rankScore = rankToScore(snapshot.rank);
      if (rankScore >= 0) {
        if (!highestRank || rankScore > highestRank.score) {
          highestRank = {
            rank: snapshot.rank,
            score: rankScore,
          };
        }
      }
    }

    for (const hero of snapshot.heroes) {
      const heroKey =
        hero.heroId !== null
          ? `id:${hero.heroId}`
          : `name:${hero.name.trim().toLowerCase()}`;
      const existing = heroTotals.get(heroKey);

      if (!existing) {
        heroTotals.set(heroKey, {
          heroId: hero.heroId,
          name: hero.name,
          matches: hero.matches,
          playTimeSeconds: hero.playTimeSeconds,
          imageUrl: hero.imageUrl,
        });
        continue;
      }

      existing.matches += hero.matches;
      existing.playTimeSeconds += hero.playTimeSeconds;

      if (!existing.imageUrl && hero.imageUrl) {
        existing.imageUrl = hero.imageUrl;
      }
    }
  }

  const topHero = Array.from(heroTotals.values()).sort((a, b) => {
    if (b.matches !== a.matches) {
      return b.matches - a.matches;
    }

    return b.playTimeSeconds - a.playTimeSeconds;
  })[0];

  let topHeroName: string | null = topHero?.name ?? null;
  let topHeroImageUrl: string | null =
    topHero?.imageUrl ?? fallbackHeroImageUrl;

  if (topHero?.heroId !== null) {
    const resolvedHero = await resolveHeroById({
      apiKey,
      heroId: topHero.heroId,
    });

    if (resolvedHero) {
      const primaryTransformation = resolvedHero.transformations[0] ?? null;

      topHeroName =
        primaryTransformation?.name ?? resolvedHero.name ?? topHeroName;

      if (primaryTransformation?.icon) {
        topHeroImageUrl = primaryTransformation.icon;
      } else if (resolvedHero.imageUrl) {
        topHeroImageUrl = resolvedHero.imageUrl;
      }
    }
  }

  const seasonRank = latestSeasonRank
    ? `${latestSeasonRank.rank} (S${getDisplaySeasonLabel(latestSeasonRank.season)})`
    : null;

  return {
    playerName: playerName ?? fallbackPlayerUid,
    seasonRank,
    topHero: topHeroName,
    highestRank: highestRank?.rank ?? null,
    timePlayedHours:
      totals.timePlayedSeconds > 0 ? totals.timePlayedSeconds / 3600 : null,
    matchesPlayed: totals.matchesPlayed > 0 ? totals.matchesPlayed : 0,
    wins: totals.wins > 0 ? totals.wins : 0,
    kos: totals.kos > 0 ? totals.kos : 0,
    assists: totals.assists > 0 ? totals.assists : 0,
    topHeroImageUrl,
    heroImageUrl: topHeroImageUrl,
    fetchedAt: new Date().toISOString(),
  };
}

async function buildBackfillProgress({
  playerUid,
  previousApiSeasons,
  now,
}: {
  playerUid: string;
  previousApiSeasons: number[];
  now: number;
}): Promise<MarvelRivalsBackfillProgress> {
  const totalHistoricalSeasons = previousApiSeasons.length;

  let cachedHistoricalSeasons = 0;
  for (const apiSeason of previousApiSeasons) {
    const snapshot = await getHistoricalSeasonSnapshot({
      playerUid,
      apiSeason,
    });

    if (snapshot) {
      cachedHistoricalSeasons += 1;
    }
  }

  const remainingHistoricalSeasons = Math.max(
    0,
    totalHistoricalSeasons - cachedHistoricalSeasons,
  );

  const percent =
    totalHistoricalSeasons === 0
      ? 100
      : Math.round((cachedHistoricalSeasons / totalHistoricalSeasons) * 100);

  const cooldownUntil = await getHistoricalCooldownUntil(playerUid);
  const nextBackfillAttemptInSeconds =
    cooldownUntil > now ? Math.ceil((cooldownUntil - now) / 1000) : null;

  return {
    totalHistoricalSeasons,
    cachedHistoricalSeasons,
    remainingHistoricalSeasons,
    percent,
    isComplete: remainingHistoricalSeasons === 0,
    nextBackfillAttemptInSeconds,
  };
}

async function getCurrentSeasonSnapshot({
  apiKey,
  playerUid,
  forceRefresh,
  now,
}: {
  apiKey: string;
  playerUid: string;
  forceRefresh: boolean;
  now: number;
}): Promise<{ snapshot: SeasonSnapshot; fromCache: boolean }> {
  const cachedCurrent = await getCurrentSeasonCacheEntry(playerUid);

  if (!forceRefresh && cachedCurrent && cachedCurrent.expiresAt > now) {
    return {
      snapshot: cachedCurrent.data,
      fromCache: true,
    };
  }

  try {
    const currentPayload = await fetchPlayerStatsPayload({
      apiKey,
      playerUid,
      season: -1,
    });

    const currentSnapshot = parseSeasonSnapshot(currentPayload, playerUid);

    await setCurrentSeasonCacheEntry({
      playerUid,
      entry: {
        data: currentSnapshot,
        expiresAt: now + CURRENT_SEASON_TTL_MS,
      },
    });

    if (currentSnapshot.seasonResponseNumber !== null) {
      const currentApiSeason = getApiSeasonFromResponseSeason(
        currentSnapshot.seasonResponseNumber,
      );

      if (currentApiSeason !== null) {
        await setHistoricalSeasonSnapshot({
          playerUid,
          apiSeason: currentApiSeason,
          snapshot: currentSnapshot,
        });
      }
    }

    return {
      snapshot: currentSnapshot,
      fromCache: false,
    };
  } catch (error) {
    if (
      cachedCurrent &&
      error instanceof MarvelRivalsApiError &&
      error.status === 429
    ) {
      return {
        snapshot: cachedCurrent.data,
        fromCache: true,
      };
    }

    throw error;
  }
}

async function getSnapshotForRequestedSeason({
  apiKey,
  playerUid,
  seasonResponseNumber,
  currentSnapshot,
  currentSnapshotFromCache,
}: {
  apiKey: string;
  playerUid: string;
  seasonResponseNumber: number;
  currentSnapshot: SeasonSnapshot;
  currentSnapshotFromCache: boolean;
}): Promise<{ snapshot: SeasonSnapshot; fromCache: boolean }> {
  if (seasonResponseNumber === currentSnapshot.seasonResponseNumber) {
    return {
      snapshot: currentSnapshot,
      fromCache: currentSnapshotFromCache,
    };
  }

  const requestedApiSeason = getApiSeasonFromResponseSeason(seasonResponseNumber);
  if (requestedApiSeason === null) {
    throw new Error(
      "Invalid season number. Use a non-negative integer API response season.",
    );
  }

  const cachedHistorical = await getHistoricalSeasonSnapshot({
    playerUid,
    apiSeason: requestedApiSeason,
  });

  if (cachedHistorical) {
    return {
      snapshot: cachedHistorical,
      fromCache: true,
    };
  }

  const seasonPayload = await fetchPlayerStatsPayload({
    apiKey,
    playerUid,
    season: requestedApiSeason,
  });

  const seasonSnapshot = parseSeasonSnapshot(seasonPayload, playerUid);
  await setHistoricalSeasonSnapshot({
    playerUid,
    apiSeason: requestedApiSeason,
    snapshot: seasonSnapshot,
  });

  return {
    snapshot: seasonSnapshot,
    fromCache: false,
  };
}

export async function getMarvelRivalsSeasons({
  apiKey,
  playerUid,
  forceRefresh = false,
}: {
  apiKey: string;
  playerUid: string;
  forceRefresh?: boolean;
}): Promise<{
  seasons: MarvelRivalsSeasonInfo[];
  currentSeasonResponseNumber: number | null;
  fromCache: boolean;
}> {
  const now = Date.now();
  const current = await getCurrentSeasonSnapshot({
    apiKey,
    playerUid,
    forceRefresh,
    now,
  });

  const currentSeasonResponseNumber = current.snapshot.seasonResponseNumber;

  if (
    currentSeasonResponseNumber === null ||
    !Number.isInteger(currentSeasonResponseNumber) ||
    currentSeasonResponseNumber < 0
  ) {
    return {
      seasons: [],
      currentSeasonResponseNumber: null,
      fromCache: current.fromCache,
    };
  }

  const seasons: MarvelRivalsSeasonInfo[] = [];

  for (
    let responseSeason = 0;
    responseSeason <= currentSeasonResponseNumber;
    responseSeason += 1
  ) {
    const pair = getSeasonPairFromResponseSeason(responseSeason);
    if (!pair) {
      continue;
    }

    seasons.push({
      responseSeason,
      apiSeason: pair[0],
      label: pair[1],
      isCurrent: responseSeason === currentSeasonResponseNumber,
    });
  }

  return {
    seasons,
    currentSeasonResponseNumber,
    fromCache: current.fromCache,
  };
}

export async function getMarvelRivalsWidgetStats({
  apiKey,
  playerUid,
  forceRefresh = false,
  seasonResponseNumber,
}: {
  apiKey: string;
  playerUid: string;
  forceRefresh?: boolean;
  seasonResponseNumber?: number;
}): Promise<{
  data: MarvelRivalsWidgetStats;
  fromCache: boolean;
  backfillProgress: MarvelRivalsBackfillProgress;
}> {
  const now = Date.now();
  let fromCache = true;

  if (
    typeof seasonResponseNumber === "number" &&
    (!Number.isInteger(seasonResponseNumber) || seasonResponseNumber < 0)
  ) {
    throw new Error(
      "Invalid season number. Use a non-negative integer API response season.",
    );
  }

  const current = await getCurrentSeasonSnapshot({
    apiKey,
    playerUid,
    forceRefresh,
    now,
  });

  const currentSnapshot = current.snapshot;
  fromCache = current.fromCache;

  if (typeof seasonResponseNumber === "number") {
    const requested = await getSnapshotForRequestedSeason({
      apiKey,
      playerUid,
      seasonResponseNumber,
      currentSnapshot,
      currentSnapshotFromCache: current.fromCache,
    });

    return {
      data: await aggregateWidgetStats([requested.snapshot], apiKey, playerUid),
      fromCache: requested.fromCache,
      backfillProgress: {
        totalHistoricalSeasons: 0,
        cachedHistoricalSeasons: 0,
        remainingHistoricalSeasons: 0,
        percent: 100,
        isComplete: true,
        nextBackfillAttemptInSeconds: null,
      },
    };
  }

  const snapshots: SeasonSnapshot[] = [currentSnapshot];
  let backfillProgress: MarvelRivalsBackfillProgress = {
    totalHistoricalSeasons: 0,
    cachedHistoricalSeasons: 0,
    remainingHistoricalSeasons: 0,
    percent: 100,
    isComplete: true,
    nextBackfillAttemptInSeconds: null,
  };

  const currentResponseSeason = currentSnapshot.seasonResponseNumber;
  if (currentResponseSeason !== null) {
    const previousApiSeasons = getPreviousApiSeasons(currentResponseSeason);
    let historicalFetchesThisRequest = 0;
    const cooldownUntil = await getHistoricalCooldownUntil(playerUid);
    const isInHistoricalCooldown = now < cooldownUntil;

    for (const apiSeason of previousApiSeasons) {
      const cachedHistorical = await getHistoricalSeasonSnapshot({
        playerUid,
        apiSeason,
      });

      if (cachedHistorical) {
        snapshots.push(cachedHistorical);
        continue;
      }

      if (isInHistoricalCooldown) {
        continue;
      }

      if (historicalFetchesThisRequest >= MAX_HISTORICAL_FETCHES_PER_REQUEST) {
        break;
      }

      fromCache = false;
      historicalFetchesThisRequest += 1;

      try {
        const seasonPayload = await fetchPlayerStatsPayload({
          apiKey,
          playerUid,
          season: apiSeason,
        });

        const seasonSnapshot = parseSeasonSnapshot(seasonPayload, playerUid);
        await setHistoricalSeasonSnapshot({
          playerUid,
          apiSeason,
          snapshot: seasonSnapshot,
        });
        snapshots.push(seasonSnapshot);
      } catch (error) {
        if (error instanceof MarvelRivalsApiError && error.status === 429) {
          await setHistoricalCooldownUntil({
            playerUid,
            cooldownUntil: Date.now() + HISTORICAL_BACKFILL_COOLDOWN_MS,
          });
          break;
        }

        throw error;
      }
    }

    backfillProgress = await buildBackfillProgress({
      playerUid,
      previousApiSeasons,
      now,
    });
  } else {
    const fallbackApiSeason = getApiSeasonFromResponseSeason(
      currentSnapshot.seasonResponseNumber ?? -1,
    );

    if (fallbackApiSeason !== null) {
      const cachedHistorical = await getHistoricalSeasonSnapshot({
        playerUid,
        apiSeason: fallbackApiSeason,
      });

      if (!cachedHistorical) {
        fromCache = false;
        const seasonPayload = await fetchPlayerStatsPayload({
          apiKey,
          playerUid,
          season: fallbackApiSeason,
        });

        const seasonSnapshot = parseSeasonSnapshot(seasonPayload, playerUid);
        await setHistoricalSeasonSnapshot({
          playerUid,
          apiSeason: fallbackApiSeason,
          snapshot: seasonSnapshot,
        });
        snapshots.push(seasonSnapshot);
      }
    }
  }

  return {
    data: await aggregateWidgetStats(snapshots, apiKey, playerUid),
    fromCache,
    backfillProgress,
  };
}
