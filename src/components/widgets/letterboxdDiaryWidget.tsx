"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { ExternalLink, Projector, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/skeleton";
import { Chip, ChipContainer, LinkChip, WidgetCard } from "./styles";

type LetterboxdDiaryFilm = {
  id: string;
  title: string;
  posterUrl: string;
  link: string;
  watchedDate: string;
  rewatch: boolean;
  seenInCinema: boolean;
};

type LetterboxdDiaryApiResponse = {
  films: LetterboxdDiaryFilm[];
};

type LetterboxdDiaryApiError = {
  error: string;
};

const FilmsRow = styled.div`
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
`;

const FilmItem = styled.a`
  color: inherit;
  text-decoration: none;
`;

const Poster = styled.img`
  aspect-ratio: 2 / 3;
  border-radius: 0.65rem;
  display: block;
  object-fit: cover;
  width: 100%;
`;

const Meta = styled.div`
  align-items: center;
  display: flex;
  font-size: 0.75rem;
  gap: 0.3rem;
  justify-content: center;
  margin-top: 0.4rem;
  opacity: 0.9;
`;

const ErrorText = styled.p`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const PosterSkeleton = styled(Skeleton)`
  border-radius: 0.65rem;
  display: block;
  width: 100%;

  &:empty {
    aspect-ratio: 2 / 3;
    height: auto;
  }
`;

const MetaSkeleton = styled(Skeleton)`
  border-radius: 999px;
  display: block;
  margin-top: 0.4rem;
  width: 100%;

  &:empty {
    height: 1rem;
  }
`;

function formatWatchDate(dateValue: string): string {
  const date = new Date(`${dateValue}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return "-- ---";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

export default function LetterboxdDiaryWidget() {
  const [films, setFilms] = useState<LetterboxdDiaryFilm[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchDiary() {
      try {
        const response = await fetch("/api/letterboxd/diary");
        const payload = (await response.json()) as
          | LetterboxdDiaryApiResponse
          | LetterboxdDiaryApiError;

        if (!response.ok) {
          throw new Error(
            "error" in payload
              ? payload.error
              : "Failed to load Letterboxd diary entries.",
          );
        }

        if (!isMounted) {
          return;
        }

        setFilms((payload as LetterboxdDiaryApiResponse).films.slice(0, 12));
        setError(null);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load Letterboxd diary entries.";
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchDiary();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <WidgetCard>
      {isLoading && (
        <>
          <FilmsRow>
            {Array.from({ length: 12 }, (_, index) => (
              <div key={`skeleton-${index}`}>
                <PosterSkeleton />
                <MetaSkeleton />
              </div>
            ))}
          </FilmsRow>
          <ChipContainer>
            <Skeleton>
              <Chip>Rocked03 on Letterboxd</Chip>
            </Skeleton>
          </ChipContainer>
        </>
      )}
      {!isLoading && error && <ErrorText>{error}</ErrorText>}
      {!isLoading && !error && (
        <>
          <FilmsRow>
            {films.map((film) => (
              <FilmItem
                key={film.id}
                href={film.link}
                target="_blank"
                rel="noreferrer"
                aria-label={`${film.title} on ${formatWatchDate(film.watchedDate)}`}
              >
                <Poster src={film.posterUrl} alt={film.title} loading="lazy" />
                <Meta>
                  {film.rewatch && <RefreshCw size={12} />}
                  {film.seenInCinema && <Projector size={12} />}
                  <span>{formatWatchDate(film.watchedDate)}</span>
                </Meta>
              </FilmItem>
            ))}
          </FilmsRow>
          <ChipContainer>
            <LinkChip
              href="https://letterboxd.com/rocked03"
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={12} /> Rocked03 on Letterboxd
            </LinkChip>
          </ChipContainer>
        </>
      )}
    </WidgetCard>
  );
}
