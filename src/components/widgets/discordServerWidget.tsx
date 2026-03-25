"use client";

import { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { DiscordPartnerIcon } from "@/utils/icons";
import { DiscordGuildInfo } from "@/lib/discord";
import { Skeleton } from "@/components/skeleton";
import { Chip, ChipContainer, LinkChip, WidgetCard } from "./styles";
import { ExternalLink } from "lucide-react";

type DiscordGuildApiError = {
  error: string;
};

const BannerMedia = styled.div`
  margin-bottom: 2rem;
  position: relative;
`;

const sharedBannerStyles = css`
  width: 100%;
  border-radius: 0.8rem;
  overflow: hidden;
`;

const BannerImage = styled.img`
  ${sharedBannerStyles}
  display: block;
  height: 100%;
  object-fit: cover;
`;

const BannerFallback = styled.div`
  ${sharedBannerStyles}
  background:
    linear-gradient(
      135deg,
      rgba(var(--text-color-rgb), 0.16),
      rgba(var(--text-color-rgb), 0.06)
    ),
    var(--super-foreground);
`;

const sharedIconStyles = css`
  border-radius: 1rem;
  border: 0.2rem solid var(--foreground);
  bottom: -2rem;
  height: 5rem;
  left: 1rem;
  position: absolute;
  width: 5rem;
  z-index: 2;
`;

const Icon = styled.img`
  ${sharedIconStyles}
  object-fit: cover;
`;

const FallbackIcon = styled.div`
  ${sharedIconStyles}
  background: rgba(var(--text-color-rgb), 0.1);
  display: grid;
  font-weight: 800;
  place-items: center;
`;

const BannerSkeleton = styled(Skeleton)`
  ${sharedBannerStyles}
  aspect-ratio: 16 / 9;
  display: block;

  &:empty {
    height: auto;
  }
`;

const IconSkeleton = styled(Skeleton)`
  ${sharedIconStyles}

  &:empty {
    height: 5rem;
  }
`;

const ServerName = styled.div`
  align-items: center;
  display: flex;
  font-size: 1.25rem;
  font-weight: 800;
  gap: 0.5rem;
`;

const ServerDescription = styled.p`
  font-size: 0.9rem;
  line-height: 1.4;
  opacity: 0.8;
`;

const ServerNameSkeleton = styled(Skeleton)`
  display: block;
  width: 62%;

  &:empty {
    height: 1.5rem;
  }
`;

const ServerDescriptionSkeleton = styled(Skeleton)`
  display: block;
  width: 92%;

  &:empty {
    height: 3.75rem;
  }
`;

function formatNumber(value: number | null): string {
  if (value === null) {
    return "N/A";
  }

  return value.toLocaleString();
}

export default function DiscordServerWidget() {
  const [data, setData] = useState<DiscordGuildInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchGuild() {
      try {
        const response = await fetch("/api/discord/server");
        const payload = (await response.json()) as
          | DiscordGuildInfo
          | DiscordGuildApiError;

        if (!response.ok) {
          throw new Error(
            "error" in payload
              ? payload.error
              : "Failed to load Discord server details.",
          );
        }

        if (!isMounted) {
          return;
        }

        setData(payload as DiscordGuildInfo);
        setError(null);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load Discord server details.";
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchGuild();

    return () => {
      isMounted = false;
    };
  }, []);

  const initial = data?.name?.charAt(0)?.toUpperCase() ?? "D";

  return (
    <WidgetCard>
      {isLoading && (
        <>
          <BannerMedia>
            <BannerSkeleton />
            <IconSkeleton />
          </BannerMedia>

          <ServerNameSkeleton />
          <ServerDescriptionSkeleton />

          <ChipContainer>
            <Skeleton>
              <Chip>100,000 members</Chip>
            </Skeleton>
            <Skeleton>
              <Chip>
                <ExternalLink size={12} />
                discord.gg/marvel
              </Chip>
            </Skeleton>
          </ChipContainer>
        </>
      )}
      {!isLoading && error && <ServerDescription>{error}</ServerDescription>}
      {!isLoading && !error && data && (
        <>
          <BannerMedia>
            {data.bannerUrl ? (
              <BannerImage src={data.bannerUrl} alt={`${data.name} banner`} />
            ) : data.splashUrl ? (
              <BannerImage src={data.splashUrl} alt={`${data.name} splash`} />
            ) : (
              <BannerFallback />
            )}

            {data.iconUrl ? (
              <Icon src={data.iconUrl} alt={`${data.name} icon`} />
            ) : (
              <FallbackIcon>{initial}</FallbackIcon>
            )}
          </BannerMedia>

          <ServerName>
            {data.name}
            {data.isPartner && <DiscordPartnerIcon size={18} />}
          </ServerName>

          {data.description && (
            <ServerDescription>{data.description}</ServerDescription>
          )}

          <ChipContainer>
            <Chip>{formatNumber(data.memberCount)} members</Chip>
            {data.vanityUrlCode && (
              <LinkChip
                href={`https://discord.gg/${data.vanityUrlCode}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={12} />
                discord.gg/{data.vanityUrlCode}
              </LinkChip>
            )}
          </ChipContainer>
        </>
      )}
    </WidgetCard>
  );
}
