import { getLetterboxdDiaryFilms } from "@/lib/letterboxd";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { films, fromCache } = await getLetterboxdDiaryFilms({
      forceRefresh: false,
    });

    return NextResponse.json(
      {
        films,
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
      { error: "Failed to load Letterboxd diary entries." },
      { status: 500 },
    );
  }
}
