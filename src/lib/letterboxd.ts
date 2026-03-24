const LETTERBOXD_RSS_URL = "https://letterboxd.com/rocked03/rss/";
const CACHE_TTL_MS = 15 * 60 * 1000;
const CINEMA_LIST_GUID = "letterboxd-list-27276449";

type CacheEntry = {
  films: LetterboxdDiaryFilm[];
  expiresAt: number;
};

export type LetterboxdDiaryFilm = {
  id: string;
  title: string;
  posterUrl: string;
  link: string;
  watchedDate: string;
  rewatch: boolean;
  seenInCinema: boolean;
};

const diaryCache: CacheEntry = {
  films: [],
  expiresAt: 0,
};

function extractTagValue(xml: string, tagName: string): string | null {
  const escapedTag = tagName.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const pattern = new RegExp(
    `<${escapedTag}>([\\s\\S]*?)</${escapedTag}>`,
    "i",
  );
  const match = xml.match(pattern);

  if (!match) {
    return null;
  }

  return match[1].trim();
}

function extractPosterUrl(description: string): string | null {
  const imgMatch = description.match(/<img[^>]+src="([^"]+)"/i);
  if (!imgMatch) {
    return null;
  }

  return imgMatch[1].trim();
}

function parseDiaryItem(itemXml: string): LetterboxdDiaryFilm | null {
  const watchedDate = extractTagValue(itemXml, "letterboxd:watchedDate");
  const title = extractTagValue(itemXml, "letterboxd:filmTitle");
  const link = extractTagValue(itemXml, "link");
  const description = extractTagValue(itemXml, "description");

  if (!watchedDate || !title || !link || !description) {
    return null;
  }

  const posterUrl = extractPosterUrl(description);
  if (!posterUrl) {
    return null;
  }

  const guid = extractTagValue(itemXml, "guid") ?? `${link}-${watchedDate}`;
  const rewatchValue = extractTagValue(itemXml, "letterboxd:rewatch");

  return {
    id: guid,
    title,
    posterUrl,
    link,
    watchedDate,
    rewatch: rewatchValue?.toLowerCase() === "yes",
    seenInCinema: false,
  };
}

function extractFilmSlug(urlValue: string): string | null {
  try {
    const url = new URL(urlValue, "https://letterboxd.com");
    const match = url.pathname.match(/\/film\/([^/]+)/i);

    if (!match) {
      return null;
    }

    return decodeURIComponent(match[1]).toLowerCase();
  } catch {
    return null;
  }
}

function extractCinemaFilmSlugs(rssXml: string): Set<string> {
  const itemMatches = rssXml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
  const listItem = itemMatches.find((itemXml) =>
    new RegExp(`<guid[^>]*>\\s*${CINEMA_LIST_GUID}\\s*<\\/guid>`, "i").test(
      itemXml,
    ),
  );

  if (!listItem) {
    return new Set<string>();
  }

  const description = extractTagValue(listItem, "description");
  if (!description) {
    return new Set<string>();
  }

  const slugs = new Set<string>();
  const anchorMatches = description.matchAll(/<a[^>]+href="([^"]+)"/gi);

  for (const anchorMatch of anchorMatches) {
    const href = anchorMatch[1];
    const slug = extractFilmSlug(href);

    if (!slug) {
      continue;
    }

    slugs.add(slug);
  }

  return slugs;
}

function parseDiaryFilms(rssXml: string): LetterboxdDiaryFilm[] {
  const itemMatches = rssXml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
  const cinemaFilmSlugs = extractCinemaFilmSlugs(rssXml);
  const films: LetterboxdDiaryFilm[] = [];

  for (const itemXml of itemMatches) {
    const film = parseDiaryItem(itemXml);
    if (!film) {
      continue;
    }

    const diaryFilmSlug = extractFilmSlug(film.link);

    films.push({
      ...film,
      seenInCinema:
        diaryFilmSlug !== null && cinemaFilmSlugs.has(diaryFilmSlug),
    });
  }

  films.sort((a, b) => {
    const dateA = new Date(a.watchedDate).getTime();
    const dateB = new Date(b.watchedDate).getTime();
    return dateB - dateA;
  });

  return films;
}

async function fetchDiaryFilms(): Promise<LetterboxdDiaryFilm[]> {
  const response = await fetch(LETTERBOXD_RSS_URL, {
    cache: "no-store",
    headers: {
      Accept: "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Letterboxd RSS request failed (${response.status})`);
  }

  const xml = await response.text();
  const films = parseDiaryFilms(xml);

  if (films.length === 0) {
    throw new Error("No diary films found in Letterboxd RSS feed.");
  }

  return films;
}

export async function getLetterboxdDiaryFilms({
  forceRefresh = false,
}: {
  forceRefresh?: boolean;
} = {}): Promise<{ films: LetterboxdDiaryFilm[]; fromCache: boolean }> {
  const now = Date.now();

  if (
    !forceRefresh &&
    diaryCache.expiresAt > now &&
    diaryCache.films.length > 0
  ) {
    return {
      films: diaryCache.films,
      fromCache: true,
    };
  }

  const films = await fetchDiaryFilms();

  diaryCache.films = films;
  diaryCache.expiresAt = now + CACHE_TTL_MS;

  return {
    films,
    fromCache: false,
  };
}
