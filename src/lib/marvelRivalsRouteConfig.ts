import { NextResponse } from "next/server";

export function getMarvelRivalsApiKey(): string | null {
  return process.env.MARVEL_RIVALS_API_KEY?.trim() || null;
}

export function getMarvelRivalsDefaultPlayerQuery(
  fallback = "1077840408",
): string {
  return (
    process.env.MARVEL_RIVALS_UID?.trim() ||
    process.env.MARVEL_RIVALS_PLAYER?.trim() ||
    fallback
  );
}

export function getMarvelRivalsPlayerQueryFromRequest(
  request: Request,
): string | null {
  const queryParam = new URL(request.url).searchParams.get("query")?.trim();
  if (queryParam) {
    return queryParam;
  }

  const fromEnv =
    process.env.MARVEL_RIVALS_UID?.trim() ||
    process.env.MARVEL_RIVALS_PLAYER?.trim() ||
    null;

  return fromEnv;
}

export function marvelRivalsMissingApiKeyResponse() {
  return NextResponse.json(
    {
      error:
        "Missing Marvel Rivals configuration. Set MARVEL_RIVALS_API_KEY in your server environment.",
    },
    { status: 400 },
  );
}

export function marvelRivalsMissingPlayerQueryResponse() {
  return NextResponse.json(
    {
      error:
        "Missing player query. Provide ?query=<uid-or-username> or set MARVEL_RIVALS_UID/MARVEL_RIVALS_PLAYER.",
    },
    { status: 400 },
  );
}
