import { getGitHubContributionAccounts } from "@/lib/github";
import { NextResponse } from "next/server";

const DEFAULT_GITHUB_USERNAMES = ["S-Ou", "Rocked03"];
const ALLOWED_GITHUB_USERNAMES = new Set(DEFAULT_GITHUB_USERNAMES);

function getGitHubToken(): string | null {
  return process.env.GITHUB_TOKEN?.trim() || null;
}

function getRequestedUsernames(request: Request): string[] {
  const { searchParams } = new URL(request.url);
  const rawUsernames = searchParams.get("usernames")?.trim();

  if (!rawUsernames) {
    return DEFAULT_GITHUB_USERNAMES;
  }

  const uniqueUsernames = Array.from(
    new Set(
      rawUsernames
        .split(",")
        .map((username) => username.trim())
        .filter((username) => username.length > 0)
        .filter((username) => ALLOWED_GITHUB_USERNAMES.has(username)),
    ),
  );

  return uniqueUsernames.length > 0
    ? uniqueUsernames
    : DEFAULT_GITHUB_USERNAMES;
}

export async function GET(request: Request) {
  try {
    const token = getGitHubToken();
    const usernames = getRequestedUsernames(request);

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Missing GitHub token. Set GITHUB_TOKEN in your server environment.",
        },
        { status: 400 },
      );
    }

    const { accounts, fromCache } = await getGitHubContributionAccounts({
      usernames,
      token,
      forceRefresh: false,
    });

    return NextResponse.json(
      {
        accounts,
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
      { error: "Failed to load GitHub contribution counts." },
      { status: 500 },
    );
  }
}
