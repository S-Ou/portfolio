"use client";

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/skeleton";
import { WidgetCard } from "./styles";
import { MarvelRivalsIcon } from "@/utils/icons";

type MarvelRivalsStats = {
  playerName: string;
  seasonRank: string | null;
  seasonLabel: string | null;
  heroes: Array<{
    name: string;
    timePlayedHours: number;
    imageUrl: string | null;
  }>;
  highestRank: string | null;
  timePlayedHours: number | null;
  matchesPlayed: number | null;
  wins: number | null;
  kos: number | null;
  assists: number | null;
  heroImageUrl?: string | null;
  backfillProgress?: {
    totalHistoricalSeasons: number;
    cachedHistoricalSeasons: number;
    remainingHistoricalSeasons: number;
    percent: number;
    isComplete: boolean;
    nextBackfillAttemptInSeconds: number | null;
  };
};

type MarvelRivalsApiError = {
  error: string;
};

type MarvelRivalsSeason = {
  responseSeason: number;
  apiSeason: number;
  label: string;
  isCurrent: boolean;
};

type MarvelRivalsSeasonsResponse = {
  seasons: MarvelRivalsSeason[];
};

const HeaderContents = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const Header = styled.p`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  height: fit-content;
`;

const SeasonSelectTrigger = styled(Select.Trigger)`
  all: unset;
  align-items: center;
  background: rgba(var(--text-color-rgb), 0.08);
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  font-size: 0.8rem;
  gap: 0.35rem;
  justify-content: space-between;
  margin: 0.15rem 0 0.25rem;
  min-width: 9rem;
  padding: 0.35rem 0.65rem;
  transition: background 0.2s;

  &:hover {
    background: rgba(var(--text-color-rgb), 0.14);
  }

  &:focus-visible {
    outline: 0.08rem solid rgba(var(--text-color-rgb), 0.2);
  }

  @media (max-width: 768px) {
    min-width: auto;
  }
`;

const SeasonSelectContent = styled(Select.Content)`
  background: var(--super-foreground);
  border: 0.08rem solid rgba(var(--text-color-rgb), 0.12);
  border-radius: 0.6rem;
  box-shadow: 0 0.4rem 1.4rem rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 100;
`;

const SeasonSelectViewport = styled(Select.Viewport)`
  padding: 0.3rem;
`;

const SeasonSelectItem = styled(Select.Item)`
  align-items: center;
  border-radius: 999px;
  cursor: pointer;
  display: flex;
  font-size: 0.8rem;
  min-height: 1.7rem;
  padding: 0.35rem 0.65rem;
  user-select: none;

  &[data-highlighted] {
    background: rgba(var(--text-color-rgb), 0.14);
    outline: none;
  }
`;

const PlayerMeta = styled.div`
  display: flex;
  height: 100%;
  gap: 0.25rem;
  flex-direction: column;
  justify-content: center;
  padding-bottom: 1rem;
`;

const PlayerName = styled.span`
  font-size: 1.25rem;
  font-weight: 600;
`;

const PlayerLine = styled.span`
  font-size: 0.9rem;
  opacity: 0.75;
`;

const PlayerPanel = styled.div`
  align-items: stretch;
  display: grid;
  gap: 0.5rem;
  grid-template-columns: minmax(0, 1fr) minmax(7rem, 38%);
  overflow: hidden;
`;

const PlayerImageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
`;

const PlayerImage = styled.img`
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
  background: rgba(var(--text-color-rgb), 0.1);
  border-radius: 1rem;
  aspect-ratio: 1 / 1;
`;

const ProgressWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const ProgressLabel = styled.p`
  font-size: 0.78rem;
  margin: 0;
  opacity: 0.75;
`;

const ProgressTrack = styled.div`
  background: rgba(var(--text-color-rgb), 0.12);
  border-radius: 999px;
  height: 0.42rem;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percent: number }>`
  background: linear-gradient(90deg, #6ca0ff, #8fd3ff);
  border-radius: inherit;
  height: 100%;
  transition: width 0.25s ease;
  width: ${({ $percent }) => `${Math.max(0, Math.min(100, $percent))}%`};
`;

const StatsGrid = styled.div`
  display: grid;
  gap: 0.75rem 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 540px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const StatValue = styled.span`
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.1;
`;

const StatLabel = styled.span`
  font-size: 0.8rem;
  opacity: 0.72;
`;

const ErrorText = styled.p`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const ImageSkeleton = styled(Skeleton)`
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 1rem;

  &:empty {
    height: auto;
  }
`;

const StatValueSkeleton = styled(Skeleton)`
  display: block;
  width: 70%;

  &:empty {
    height: 1.1rem;
  }
`;

const StatLabelSkeleton = styled(Skeleton)`
  display: block;
  width: 65%;

  &:empty {
    height: 0.9rem;
  }
`;

const PlayerNameSkeleton = styled(Skeleton)`
  display: block;
  width: min(14rem, 85%);

  &:empty {
    height: 1.6rem;
  }
`;

const PlayerLineSkeleton = styled(Skeleton)`
  display: block;
  width: min(16rem, 95%);

  &:empty {
    height: 1rem;
  }
`;

const TopHeroesGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(5, minmax(0, 1fr));

  @media (max-width: 768px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));

    & > *:nth-child(n + 5) {
      display: none;
    }
  }
`;

const TopHeroItem = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-direction: column;
`;

const TopHeroImage = styled.img`
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  background: rgba(var(--text-color-rgb), 0.1);
  border-radius: 0.6rem;
`;

const TopHeroImageSkeleton = styled(Skeleton)`
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 0.6rem;

  &:empty {
    height: auto;
  }
`;

function formatCompact(value: number | null): string {
  if (value === null) {
    return "N/A";
  }

  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatHours(value: number | null): string {
  if (value === null) {
    return "N/A";
  }

  return `${value.toFixed(1).toLocaleString()} hrs`;
}

function getBackfillText(data: MarvelRivalsStats): string | null {
  const progress = data.backfillProgress;
  if (!progress || progress.totalHistoricalSeasons === 0) {
    return null;
  }

  if (progress.isComplete) {
    return `Backfill complete (${progress.cachedHistoricalSeasons}/${progress.totalHistoricalSeasons})`;
  }

  return `Backfill ${progress.cachedHistoricalSeasons}/${progress.totalHistoricalSeasons} seasons (${progress.percent}%)`;
}

function getNextBackfillText(data: MarvelRivalsStats): string | null {
  const seconds = data.backfillProgress?.nextBackfillAttemptInSeconds;
  if (typeof seconds !== "number" || seconds <= 0) {
    return null;
  }

  return ` - Retrying in ${seconds}s`;
}

export default function MarvelRivalsStatsWidget() {
  const [data, setData] = useState<MarvelRivalsStats | null>(null);
  const [seasons, setSeasons] = useState<MarvelRivalsSeason[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [isSeasonsLoaded, setIsSeasonsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const latestDataRef = useRef<MarvelRivalsStats | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSeasons() {
      try {
        const response = await fetch("/api/marvel-rivals/seasons");
        const payload = (await response.json()) as
          | MarvelRivalsSeasonsResponse
          | MarvelRivalsApiError;

        if (!response.ok) {
          throw new Error(
            "error" in payload
              ? payload.error
              : "Failed to load Marvel Rivals seasons.",
          );
        }

        if (!isMounted) {
          return;
        }

        const list = (payload as MarvelRivalsSeasonsResponse).seasons;
        setSeasons(
          [...list].sort((a, b) => b.responseSeason - a.responseSeason),
        );
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load Marvel Rivals seasons.";
        setError(message);
      } finally {
        if (isMounted) {
          setIsSeasonsLoaded(true);
        }
      }
    }

    void fetchSeasons();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isSeasonsLoaded) {
      return;
    }

    let isMounted = true;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    function clearRefreshTimer() {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
      }
    }

    function getNextRefreshDelayMs(nextAttemptSeconds: number | null): number {
      if (typeof nextAttemptSeconds === "number" && nextAttemptSeconds > 0) {
        return Math.min(Math.max(nextAttemptSeconds * 1000, 5_000), 60_000);
      }

      return 15_000;
    }

    async function fetchStats(initialLoad: boolean) {
      try {
        if (initialLoad) {
          setIsLoading(true);
        }

        const statsQuery =
          selectedSeason === "all"
            ? ""
            : `?season=${encodeURIComponent(selectedSeason)}`;

        const response = await fetch(`/api/marvel-rivals/stats${statsQuery}`);
        const payload = (await response.json()) as
          | MarvelRivalsStats
          | MarvelRivalsApiError;

        if (!response.ok) {
          throw new Error(
            "error" in payload
              ? payload.error
              : "Failed to load Marvel Rivals stats.",
          );
        }

        if (!isMounted) {
          return;
        }

        const stats = payload as MarvelRivalsStats;
        latestDataRef.current = stats;
        setData(stats);
        setError(null);

        const progress = stats.backfillProgress;
        if (
          progress &&
          progress.totalHistoricalSeasons > 0 &&
          !progress.isComplete
        ) {
          clearRefreshTimer();
          refreshTimer = setTimeout(() => {
            void fetchStats(false);
          }, getNextRefreshDelayMs(progress.nextBackfillAttemptInSeconds));
        }
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load Marvel Rivals stats.";
        setError(message);

        const latestData = latestDataRef.current;
        if (
          latestData?.backfillProgress &&
          !latestData.backfillProgress.isComplete
        ) {
          clearRefreshTimer();
          refreshTimer = setTimeout(() => {
            void fetchStats(false);
          }, 20_000);
        }
      } finally {
        if (isMounted && initialLoad) {
          // debugging-- wait 0.5 a second before hiding loading state to better see it during refreshes

          setTimeout(() => {
            setIsLoading(false);
          }, 500);

          // setIsLoading(false);
        }
      }
    }

    void fetchStats(true);

    return () => {
      isMounted = false;
      clearRefreshTimer();
    };
  }, [isSeasonsLoaded, selectedSeason]);

  const displayHeroImageUrl =
    data?.heroes?.[0]?.imageUrl ?? data?.heroImageUrl ?? null;
  const topHeroName = data?.heroes?.[0]?.name ?? null;
  const topHeroTimePlayedHours = data?.heroes?.[0]?.timePlayedHours ?? null;

  return (
    <WidgetCard>
      <HeaderContents>
        <Header>
          <MarvelRivalsIcon size={20} /> Marvel Rivals
        </Header>
        <Select.Root
          value={selectedSeason}
          onValueChange={setSelectedSeason}
          disabled={!isSeasonsLoaded}
        >
          <SeasonSelectTrigger aria-label="Season">
            <Select.Value placeholder="All seasons" />
            <Select.Icon>
              <ChevronDown size={14} />
            </Select.Icon>
          </SeasonSelectTrigger>
          <Select.Portal>
            <SeasonSelectContent sideOffset={6}>
              <SeasonSelectViewport>
                <SeasonSelectItem value="all">
                  <Select.ItemText>All seasons</Select.ItemText>
                </SeasonSelectItem>
                {seasons.map((season) => (
                  <SeasonSelectItem
                    key={season.responseSeason}
                    value={`${season.responseSeason}`}
                  >
                    <Select.ItemText>
                      {`Season ${season.label}${season.isCurrent ? " (Live)" : ""}`}
                    </Select.ItemText>
                  </SeasonSelectItem>
                ))}
              </SeasonSelectViewport>
            </SeasonSelectContent>
          </Select.Portal>
        </Select.Root>
      </HeaderContents>

      {isLoading && (
        <>
          <PlayerPanel>
            <PlayerMeta>
              <PlayerNameSkeleton />
              <PlayerLineSkeleton />
              <PlayerLineSkeleton />
            </PlayerMeta>
            <PlayerImageWrapper>
              <ImageSkeleton />
              <StatLabelSkeleton />
            </PlayerImageWrapper>
          </PlayerPanel>
          <StatsGrid>
            {Array.from({ length: 6 }, (_, index) => (
              <Stat key={`rivals-stat-skeleton-${index}`}>
                <StatValueSkeleton />
                <StatLabelSkeleton />
              </Stat>
            ))}
          </StatsGrid>
          <TopHeroesGrid>
            {Array.from({ length: 5 }, (_, index) => (
              <TopHeroItem key={`rivals-top-hero-skeleton-${index}`}>
                <TopHeroImageSkeleton />
                <StatLabelSkeleton />
              </TopHeroItem>
            ))}
          </TopHeroesGrid>
        </>
      )}

      {!isLoading && error && !data && <ErrorText>{error}</ErrorText>}

      {!isLoading && !error && data && (
        <>
          <PlayerPanel>
            <PlayerMeta>
              <PlayerName>{data.playerName}</PlayerName>
              <PlayerLine>
                {data.seasonLabel ?? "N/A"}: {data.seasonRank ?? "Unranked"}
              </PlayerLine>
              <PlayerLine>Top Hero: {topHeroName ?? "N/A"}</PlayerLine>
            </PlayerMeta>
            {displayHeroImageUrl && (
              <PlayerImageWrapper>
                <PlayerImage
                  src={displayHeroImageUrl}
                  alt={`${topHeroName ?? "Top hero"} artwork`}
                />
                <StatLabel>
                  {topHeroTimePlayedHours
                    ? `${topHeroTimePlayedHours.toFixed(1)} hours played`
                    : "N/A"}
                </StatLabel>
              </PlayerImageWrapper>
            )}
          </PlayerPanel>

          {data.backfillProgress &&
            !data.backfillProgress.isComplete &&
            data.backfillProgress.totalHistoricalSeasons > 0 && (
              <ProgressWrap>
                <ProgressLabel>
                  {getBackfillText(data)} {getNextBackfillText(data)}
                </ProgressLabel>

                <ProgressTrack>
                  <ProgressFill $percent={data.backfillProgress.percent} />
                </ProgressTrack>
              </ProgressWrap>
            )}

          <StatsGrid>
            <Stat>
              <StatValue>{data.highestRank ?? "Unranked"}</StatValue>
              <StatLabel>Highest Rank</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{formatHours(data.timePlayedHours)}</StatValue>
              <StatLabel>Time Played</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{formatCompact(data.matchesPlayed)}</StatValue>
              <StatLabel>Matches Played</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{formatCompact(data.wins)}</StatValue>
              <StatLabel>Wins</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{formatCompact(data.kos)}</StatValue>
              <StatLabel>KOs</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{formatCompact(data.assists)}</StatValue>
              <StatLabel>Assists</StatLabel>
            </Stat>
          </StatsGrid>

          <TopHeroesGrid>
            {data.heroes.slice(1, 6).map((hero, index) => (
              <TopHeroItem key={index}>
                {hero.imageUrl ? (
                  <TopHeroImage src={hero.imageUrl} alt={hero.name} />
                ) : (
                  <TopHeroImage as="div" />
                )}
                <StatLabel>{formatHours(hero.timePlayedHours)}</StatLabel>
              </TopHeroItem>
            ))}
          </TopHeroesGrid>
        </>
      )}
    </WidgetCard>
  );
}
