import { getMarvelRivalsPlayerUpdate } from "@/lib/marvelRivals";
import {
  getMarvelRivalsApiKey,
  getMarvelRivalsPlayerQueryFromRequest,
  marvelRivalsMissingApiKeyResponse,
  marvelRivalsMissingPlayerQueryResponse,
} from "@/lib/marvelRivalsRouteConfig";
import { NextResponse } from "next/server";

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

    return NextResponse.json(result.payload, {
      status: result.status || 500,
      headers: {
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
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
