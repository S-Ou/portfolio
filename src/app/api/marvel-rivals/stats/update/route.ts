import {
  getMarvelRivalsWidgetStats,
  getMarvelRivalsPlayerUpdate,
  invalidateMarvelRivalsStatsCache,
} from "@/lib/marvelRivals";
import {
  getMarvelRivalsApiKey,
  getMarvelRivalsPlayerQueryFromRequest,
  marvelRivalsMissingApiKeyResponse,
  marvelRivalsMissingPlayerQueryResponse,
} from "@/lib/marvelRivalsRouteConfig";
import { NextResponse } from "next/server";

const CACHE_INVALIDATION_DELAY_MS = 5 * 60 * 1000;
const cacheInvalidationTimersByPlayer = new Map<
  string,
  ReturnType<typeof setTimeout>
>();
const consecutive429ByPlayer = new Map<string, number>();

function scheduleStatsCacheInvalidation(playerQuery: string): void {
  const key = playerQuery.toLowerCase();
  if (cacheInvalidationTimersByPlayer.has(key)) {
    return;
  }

  const timerId = setTimeout(async () => {
    try {
      await invalidateMarvelRivalsStatsCache(playerQuery);
    } catch (error) {
      console.error(
        "Failed to invalidate Marvel Rivals stats cache after update:",
        error,
      );
    } finally {
      cacheInvalidationTimersByPlayer.delete(key);
    }
  }, CACHE_INVALIDATION_DELAY_MS);

  cacheInvalidationTimersByPlayer.set(key, timerId);
}

export async function GET(request: Request) {
  try {
    const apiKey = getMarvelRivalsApiKey();

    if (!apiKey) {
      return marvelRivalsMissingApiKeyResponse();
    }

    const query = getMarvelRivalsPlayerQueryFromRequest(request);

    if (!query) {
      return marvelRivalsMissingPlayerQueryResponse();
    }

    const result = await getMarvelRivalsPlayerUpdate({
      apiKey,
      playerQuery: query,
    });
    let refreshNote: string | null = null;

    const playerKey = query.toLowerCase();

    if (result.status === 429) {
      const nextCount = (consecutive429ByPlayer.get(playerKey) ?? 0) + 1;
      consecutive429ByPlayer.set(playerKey, nextCount);

      if (nextCount >= 2) {
        consecutive429ByPlayer.delete(playerKey);

        try {
          await invalidateMarvelRivalsStatsCache(query);
          await getMarvelRivalsWidgetStats({
            apiKey,
            playerUid: query,
            forceRefresh: true,
          });
          refreshNote =
            "Stats cache was refreshed after consecutive rate-limit responses.";
        } catch (error) {
          console.error(
            "Failed to refresh Marvel Rivals stats after consecutive 429 responses:",
            error,
          );
        }
      }
    } else {
      consecutive429ByPlayer.delete(playerKey);
    }

    if (result.status === 200) {
      scheduleStatsCacheInvalidation(query);
    }

    return NextResponse.json(result.payload, {
      status: result.status || 500,
      headers: {
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
        ...(refreshNote
          ? {
              "x-marvel-rivals-refresh-note": refreshNote,
            }
          : {}),
      },
    });
  } catch (error) {
    console.error("Error updating Marvel Rivals player:", error);

    return NextResponse.json(
      { error: "Failed to trigger Marvel Rivals player update." },
      { status: 500 },
    );
  }
}
