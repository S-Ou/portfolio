import { getMarvelRivalsWidgetStats } from "@/lib/marvelRivals";
import {
  getMarvelRivalsApiKey,
  getMarvelRivalsDefaultPlayerQuery,
  marvelRivalsMissingApiKeyResponse,
} from "@/lib/marvelRivalsRouteConfig";
import { NextResponse } from "next/server";

function parseSeasonParam(request: Request): number | undefined {
  const seasonRaw = new URL(request.url).searchParams.get("season");

  if (!seasonRaw || !seasonRaw.trim()) {
    return undefined;
  }

  const season = Number(seasonRaw.trim());
  if (!Number.isInteger(season) || season < 0) {
    throw new Error(
      "Invalid season query parameter. Use a non-negative integer API response season number.",
    );
  }

  return season;
}

export async function GET(request: Request) {
  try {
    const apiKey = getMarvelRivalsApiKey();

    if (!apiKey) {
      return marvelRivalsMissingApiKeyResponse();
    }

    const seasonResponseNumber = parseSeasonParam(request);

    const { data, fromCache, backfillProgress } =
      await getMarvelRivalsWidgetStats({
        apiKey,
        playerUid: getMarvelRivalsDefaultPlayerQuery(),
        forceRefresh: false,
        seasonResponseNumber,
      });

    return NextResponse.json(
      {
        ...data,
        fromCache,
        backfillProgress,
      },
      {
        status: 200,
        headers: {
          "cache-control": "no-store",
          "x-content-type-options": "nosniff",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching Marvel Rivals stats:", error);

    if (
      error instanceof Error &&
      /Invalid season query parameter/i.test(error.message)
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (
      error instanceof Error &&
      /\(429\)|too many requests|slow down/i.test(error.message)
    ) {
      return NextResponse.json(
        { error: "Marvel Rivals API rate limited. Try again shortly." },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: "Failed to load Marvel Rivals stats." },
      { status: 500 },
    );
  }
}
