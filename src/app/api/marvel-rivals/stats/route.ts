import { getMarvelRivalsWidgetStats } from "@/lib/marvelRivals";
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

    const seasonResponseNumber = parseSeasonParam(request);

    const { data, fromCache, backfillProgress } =
      await getMarvelRivalsWidgetStats({
        apiKey,
        playerUid: getPlayerUid(),
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

    if (error instanceof Error && /Invalid season query parameter/i.test(error.message)) {
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
