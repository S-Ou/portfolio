import { getDiscordGuildInfo } from "@/lib/discord";
import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://rocked03.dev",
  "https://www.rocked03.dev",
  "https://sjou.dev",
  "https://www.sjou.dev",
]);

function getServerToken(): string | null {
  return process.env.DISCORD_BOT_TOKEN?.trim() || null;
}

function getGuildId(): string {
  const guildId = process.env.DISCORD_GUILD_ID?.trim();
  if (!guildId) {
    throw new Error("DISCORD_GUILD_ID is not set in environment");
  }
  return guildId;
}

function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    // Allow same-origin server-to-server requests that do not send Origin.
    return true;
  }

  return ALLOWED_ORIGINS.has(origin);
}

export async function GET(request: Request) {
  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const token = getServerToken();

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Missing Discord token. Set DISCORD_BOT_TOKEN in your server environment.",
        },
        { status: 400 },
      );
    }

    const { data, fromCache } = await getDiscordGuildInfo({
      token,
      guildId: getGuildId(),
      forceRefresh: false,
    });

    return NextResponse.json(
      {
        ...data,
        fromCache,
      },
      {
        status: 200,
        headers: {
          "cache-control": "no-store",
          "x-content-type-options": "nosniff",
          "x-frame-options": "DENY",
          "referrer-policy": "no-referrer",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = /\(401\)|\(403\)/.test(message) ? 401 : 500;

    if (status === 401) {
      return NextResponse.json(
        { error: "Discord authentication failed." },
        { status: 401 },
      );
    }

    if (status === 500) {
      return NextResponse.json(
        { error: "Failed to fetch Discord server details." },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: message }, { status });
  }
}
