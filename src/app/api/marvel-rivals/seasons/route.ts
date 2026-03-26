import { getMarvelRivalsSeasons } from "@/lib/marvelRivals";
import {
  getMarvelRivalsApiKey,
  getMarvelRivalsDefaultPlayerQuery,
  marvelRivalsMissingApiKeyResponse,
} from "@/lib/marvelRivalsRouteConfig";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = getMarvelRivalsApiKey();

    if (!apiKey) {
      return marvelRivalsMissingApiKeyResponse();
    }

    const { seasons, currentSeasonResponseNumber, fromCache } =
      await getMarvelRivalsSeasons({
        apiKey,
        playerUid: getMarvelRivalsDefaultPlayerQuery(),
        forceRefresh: false,
      });

    return NextResponse.json(
      {
        currentSeasonResponseNumber,
        seasons,
        fromCache,
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
    console.error("Error fetching Marvel Rivals seasons:", error);

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
      { error: "Failed to load Marvel Rivals seasons." },
      { status: 500 },
    );
  }
}
