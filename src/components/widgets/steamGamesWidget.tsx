"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/skeleton";
import { SteamWidgetGame } from "@/lib/steam";
import { Chip, ChipContainer, LinkChip, WidgetCard } from "./styles";

type SteamGamesApiResponse = {
  games: SteamWidgetGame[];
  profileUrl: string;
};

type SteamGamesApiError = {
  error: string;
};

const GamesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const GameRow = styled.a`
  align-items: stretch;
  color: inherit;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(7.5rem, 40%) minmax(0, 1fr);
  text-decoration: none;

  &:hover {
    opacity: 0.92;
  }
`;

const GameRowSkeleton = styled.div`
  align-items: stretch;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(7.5rem, 40%) minmax(0, 1fr);
`;

const HeaderImage = styled.img`
  border-radius: 0.65rem;
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const MetaBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  justify-content: center;
  min-width: 0;
`;

const Title = styled.h4`
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MetaText = styled.p`
  font-size: 0.82rem;
  margin: 0;
  opacity: 0.82;
`;

const ErrorText = styled.p`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const HeaderImageSkeleton = styled(Skeleton)`
  border-radius: 0.65rem;
  display: block;
  width: 100%;

  &:empty {
    aspect-ratio: 460 / 215;
    height: auto;
  }
`;

const MetaSkeletonBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  justify-content: center;
  min-width: 0;
`;

const MetaSkeleton = styled(Skeleton)`
  display: block;

  &:empty {
    height: 0.85rem;
  }
`;

const TitleSkeleton = styled(MetaSkeleton)`
  width: 75%;

  &:empty {
    height: 1rem;
  }
`;

const PlaytimeSkeleton = styled(MetaSkeleton)`
  width: 58%;
`;

const AchievementsSkeleton = styled(MetaSkeleton)`
  width: 48%;
`;

function formatPlaytime(minutes: number): string {
  const hours = Math.round((minutes / 60) * 10) / 10;

  return `${hours.toLocaleString()} hrs played`;
}

function formatAchievementCount(unlocked: number, total: number): string {
  return `${unlocked.toLocaleString()}/${total.toLocaleString()} achievements`;
}

function getSteamStoreLink(appId: number): string {
  return `https://store.steampowered.com/app/${appId}/`;
}

export default function SteamGamesWidget() {
  const [games, setGames] = useState<SteamWidgetGame[]>([]);
  const [profileUrl, setProfileUrl] = useState<string>(
    "https://steamcommunity.com/id/rocked03/",
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchSteamGames() {
      try {
        const response = await fetch("/api/steam/games");
        const payload = (await response.json()) as
          | SteamGamesApiResponse
          | SteamGamesApiError;

        if (!response.ok) {
          throw new Error(
            "error" in payload ? payload.error : "Failed to load Steam games.",
          );
        }

        if (!isMounted) {
          return;
        }

        const steamPayload = payload as SteamGamesApiResponse;
        setGames(steamPayload.games);
        setProfileUrl(steamPayload.profileUrl);
        setError(null);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load Steam games.";
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchSteamGames();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <WidgetCard>
      {isLoading && (
        <>
          <GamesList>
            {Array.from({ length: 5 }, (_, index) => (
              <GameRowSkeleton key={`steam-skeleton-${index}`}>
                <HeaderImageSkeleton />
                <MetaSkeletonBlock>
                  <TitleSkeleton />
                  <PlaytimeSkeleton />
                  <AchievementsSkeleton />
                </MetaSkeletonBlock>
              </GameRowSkeleton>
            ))}
          </GamesList>
          <ChipContainer>
            <Skeleton>
              <Chip>Rocked03 on Steam</Chip>
            </Skeleton>
          </ChipContainer>
        </>
      )}

      {!isLoading && error && <ErrorText>{error}</ErrorText>}

      {!isLoading && !error && (
        <>
          <GamesList>
            {games.map((game) => (
              <GameRow
                key={game.appId}
                href={getSteamStoreLink(game.appId)}
                target="_blank"
                rel="noreferrer"
                aria-label={`${game.name} on Steam`}
              >
                <HeaderImage
                  src={game.headerImageUrl}
                  alt={`${game.name} header image`}
                />
                <MetaBlock>
                  <Title>{game.name}</Title>
                  <MetaText>{formatPlaytime(game.playtimeMinutes)}</MetaText>
                  {typeof game.totalAchievementCount === "number" &&
                    game.totalAchievementCount > 0 &&
                    typeof game.unlockedAchievementCount === "number" && (
                      <MetaText>
                        {formatAchievementCount(
                          game.unlockedAchievementCount,
                          game.totalAchievementCount,
                        )}
                      </MetaText>
                    )}
                </MetaBlock>
              </GameRow>
            ))}
          </GamesList>

          <ChipContainer>
            <LinkChip
              href={profileUrl}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={12} /> Rocked03 on Steam
            </LinkChip>
          </ChipContainer>
        </>
      )}
    </WidgetCard>
  );
}
