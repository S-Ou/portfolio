import { getMarvelRivalsSeasons } from "@/lib/marvelRivals";
import { NextResponse } from "next/server";

function getApiKey(): string | null {
  return process.env.MARVEL_RIVALS_API_KEY?.trim() || null;
}

function getPlayerUid(): string {
  return (
    process.env.MARVEL_RIVALS_UID?.trim() ||
    process.env.MARVEL_RIVALS_PLAYER?.trim() ||
    "1077840408"
  );
}

export async function GET() {
  try {
    const apiKey = getApiKey();

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Missing Marvel Rivals configuration. Set MARVEL_RIVALS_API_KEY in your server environment.",
        },
        { status: 400 },
      );
    }

    const { seasons, currentSeasonResponseNumber, fromCache } =
      await getMarvelRivalsSeasons({
        apiKey,
        playerUid: getPlayerUid(),
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
