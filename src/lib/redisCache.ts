import { Redis } from "@upstash/redis";

let redisInstance: Redis | null | undefined;
let redisConfigSignature: string | null = null;

function getEnvValue(name: string): string | null {
  return process.env[name]?.trim() || null;
}

function getRedisUrl(): string | null {
  return getEnvValue("UPSTASH_REDIS_REST_URL");
}

function getRedisToken(): string | null {
  return getEnvValue("UPSTASH_REDIS_REST_TOKEN");
}

export function getRedisClient(): Redis | null {
  const url = getRedisUrl();
  const token = getRedisToken();
  const signature = `${url || ""}|${token || ""}`;

  if (redisInstance !== undefined && redisConfigSignature === signature) {
    return redisInstance;
  }

  redisConfigSignature = signature;

  if (!url || !token) {
    redisInstance = null;
    return redisInstance;
  }

  redisInstance = new Redis({
    url,
    token,
  });

  return redisInstance;
}

function getCachePrefix(): string {
  const configured = getEnvValue("MARVEL_RIVALS_CACHE_PREFIX");
  return configured || "mr:shared";
}

export function buildCacheKey(suffix: string): string {
  return `${getCachePrefix()}:${suffix}`;
}

export async function getJsonValue<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  if (!redis) {
    return null;
  }

  const value = await redis.get<T>(key);
  return value ?? null;
}

export async function setJsonValue(
  key: string,
  value: unknown,
  ttlSeconds?: number,
): Promise<void> {
  const redis = getRedisClient();
  if (!redis) {
    return;
  }

  if (typeof ttlSeconds === "number" && ttlSeconds > 0) {
    await redis.set(key, value, {
      ex: Math.round(ttlSeconds),
    });
    return;
  }

  await redis.set(key, value);
}
