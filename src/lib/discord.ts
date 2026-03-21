const DEFAULT_GUILD_ID = "281648235557421056";
const CACHE_TTL_MS = 3_600_000;

type CacheEntry = {
  data: DiscordGuildInfo;
  expiresAt: number;
};

type DiscordGuildApiResponse = {
  id: string;
  name: string;
  icon: string | null;
  splash: string | null;
  banner: string | null;
  description: string | null;
  vanity_url_code: string | null;
  approximate_member_count?: number;
  approximate_presence_count?: number;
};

export type DiscordGuildInfo = {
  guildId: string;
  name: string;
  iconUrl: string | null;
  splashUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
  vanityUrlCode: string | null;
  memberCount: number | null;
  onlineCount: number | null;
  fetchedAt: string;
};

const guildCache = new Map<string, CacheEntry>();

function normalizeToken(token: string): string {
  const trimmed = token.trim();

  if (trimmed.toLowerCase().startsWith("bot ")) {
    return trimmed;
  }

  return `Bot ${trimmed}`;
}

function buildGuildIconUrl(
  guildId: string,
  iconHash: string | null,
): string | null {
  if (!iconHash) {
    return null;
  }

  const extension = iconHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.${extension}?size=256`;
}

function buildGuildSplashUrl(
  guildId: string,
  splashHash: string | null,
): string | null {
  if (!splashHash) {
    return null;
  }

  return `https://cdn.discordapp.com/splashes/${guildId}/${splashHash}.png?size=2048`;
}

function buildGuildBannerUrl(
  guildId: string,
  bannerHash: string | null,
): string | null {
  if (!bannerHash) {
    return null;
  }

  const extension = bannerHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/banners/${guildId}/${bannerHash}.${extension}?size=2048`;
}

async function fetchGuildFromDiscord({
  guildId,
  token,
}: {
  guildId: string;
  token: string;
}): Promise<DiscordGuildInfo> {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}?with_counts=true`,
    {
      headers: {
        Authorization: normalizeToken(token),
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Discord API request failed (${response.status}): ${errorText}`,
    );
  }

  const guild = (await response.json()) as DiscordGuildApiResponse;

  return {
    guildId: guild.id,
    name: guild.name,
    iconUrl: buildGuildIconUrl(guild.id, guild.icon),
    splashUrl: buildGuildSplashUrl(guild.id, guild.splash),
    bannerUrl: buildGuildBannerUrl(guild.id, guild.banner),
    description: guild.description,
    vanityUrlCode: guild.vanity_url_code,
    memberCount: guild.approximate_member_count ?? null,
    onlineCount: guild.approximate_presence_count ?? null,
    fetchedAt: new Date().toISOString(),
  };
}

export async function getDiscordGuildInfo({
  token,
  guildId = DEFAULT_GUILD_ID,
  forceRefresh = false,
}: {
  token: string;
  guildId?: string;
  forceRefresh?: boolean;
}): Promise<{ data: DiscordGuildInfo; fromCache: boolean }> {
  const now = Date.now();
  const cacheKey = guildId;
  const cached = guildCache.get(cacheKey);

  if (!forceRefresh && cached && cached.expiresAt > now) {
    return { data: cached.data, fromCache: true };
  }

  const freshData = await fetchGuildFromDiscord({ guildId, token });

  guildCache.set(cacheKey, {
    data: freshData,
    expiresAt: now + CACHE_TTL_MS,
  });

  return { data: freshData, fromCache: false };
}
