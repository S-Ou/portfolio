import { getSteamWidgetGames } from "@/lib/steam";
import { NextResponse } from "next/server";

function getSteamApiKey(): string | null {
  return process.env.STEAM_API_KEY?.trim() || null;
}

function getSteamId(): string | null {
  return process.env.STEAM_ID?.trim() || null;
}

export async function GET() {
  try {
    const apiKey = getSteamApiKey();
    const steamId = getSteamId();

    if (!apiKey || !steamId) {
      return NextResponse.json(
        {
          error:
            "Missing Steam configuration. Set STEAM_API_KEY and STEAM_ID in your server environment.",
        },
        { status: 400 },
      );
    }

    const { games, fromCache } = await getSteamWidgetGames({
      apiKey,
      steamId,
      forceRefresh: false,
    });

    return NextResponse.json(
      {
        games,
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
  } catch {
    return NextResponse.json(
      { error: "Failed to load Steam games." },
      { status: 500 },
    );
  }
}
