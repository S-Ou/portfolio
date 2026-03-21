const GITHUB_BASE_URL = "https://github.com";
const GITHUB_API_URL = "https://api.github.com/graphql";
const CACHE_TTL_MS = 60 * 60 * 1000;

type CacheEntry = {
  accounts: GitHubContributionAccount[];
  expiresAt: number;
};

export type GitHubContributionAccount = {
  username: string;
  contributionCountPastYear: number;
  followerCount: number;
  totalStarsReceived: number;
  profileUrl: string;
};

type GitHubGraphQlResponse = {
  data?: {
    user?: {
      followers?: {
        totalCount?: number;
      };
      repositories?: {
        nodes?: Array<{
          stargazerCount?: number;
        }>;
      };
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions?: number;
        };
      };
    };
  };
  errors?: Array<{
    message?: string;
  }>;
};

const contributionCache = new Map<string, CacheEntry>();

function formatDateToIso(date: Date): string {
  return date.toISOString();
}

function getContributionDateRange(): { from: string; to: string } {
  const toDate = new Date();
  const fromDate = new Date(toDate);

  fromDate.setUTCFullYear(toDate.getUTCFullYear() - 1);

  return {
    from: formatDateToIso(fromDate),
    to: formatDateToIso(toDate),
  };
}

async function fetchAccountStatsPastYear({
  username,
  token,
}: {
  username: string;
  token: string;
}): Promise<{
  contributionCountPastYear: number;
  followerCount: number;
  totalStarsReceived: number;
}> {
  const { from, to } = getContributionDateRange();
  const response = await fetch(GITHUB_API_URL, {
    method: "POST",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "portfolio-github-widget",
    },
    body: JSON.stringify({
      query: `
        query UserContributions($username: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $username) {
            followers {
              totalCount
            }
            repositories(
              first: 100
              privacy: PUBLIC
              ownerAffiliations: OWNER
              isFork: false
              orderBy: { field: STARGAZERS, direction: DESC }
            ) {
              nodes {
                stargazerCount
              }
            }
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar {
                totalContributions
              }
            }
          }
        }
      `,
      variables: {
        username,
        from,
        to,
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `GitHub API request failed (${response.status}): ${message}`,
    );
  }

  const payload = (await response.json()) as GitHubGraphQlResponse;

  if (payload.errors && payload.errors.length > 0) {
    const combinedMessage = payload.errors
      .map((error) => error.message)
      .filter((message): message is string => Boolean(message))
      .join("; ");
    throw new Error(
      combinedMessage || "Unknown GraphQL error while fetching GitHub data.",
    );
  }

  const user = payload.data?.user;
  const totalContributions =
    user?.contributionsCollection?.contributionCalendar?.totalContributions;
  const followerCount = user?.followers?.totalCount;

  const totalStarsReceived =
    user?.repositories?.nodes?.reduce((sum, repository) => {
      return sum + (repository.stargazerCount ?? 0);
    }, 0) ?? 0;

  if (typeof totalContributions !== "number") {
    throw new Error(`Could not resolve contribution count for ${username}.`);
  }

  if (typeof followerCount !== "number") {
    throw new Error(`Could not resolve follower count for ${username}.`);
  }

  return {
    contributionCountPastYear: totalContributions,
    followerCount,
    totalStarsReceived,
  };
}

function getCacheKey(usernames: string[]): string {
  return usernames
    .map((username) => username.toLowerCase())
    .sort()
    .join("|");
}

export async function getGitHubContributionAccounts({
  usernames,
  token,
  forceRefresh = false,
}: {
  usernames: string[];
  token: string;
  forceRefresh?: boolean;
}): Promise<{ accounts: GitHubContributionAccount[]; fromCache: boolean }> {
  const cacheKey = getCacheKey(usernames);
  const now = Date.now();
  const cached = contributionCache.get(cacheKey);

  if (!forceRefresh && cached && cached.expiresAt > now) {
    return {
      accounts: cached.accounts,
      fromCache: true,
    };
  }

  const accounts = await Promise.all(
    usernames.map(async (username) => {
      const accountStats = await fetchAccountStatsPastYear({
        username,
        token,
      });

      return {
        username,
        contributionCountPastYear: accountStats.contributionCountPastYear,
        followerCount: accountStats.followerCount,
        totalStarsReceived: accountStats.totalStarsReceived,
        profileUrl: `${GITHUB_BASE_URL}/${username}`,
      };
    }),
  );

  contributionCache.set(cacheKey, {
    accounts,
    expiresAt: now + CACHE_TTL_MS,
  });

  return {
    accounts,
    fromCache: false,
  };
}
