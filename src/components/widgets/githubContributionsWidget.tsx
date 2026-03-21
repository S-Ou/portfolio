"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { Skeleton } from "@/components/skeleton";
import { LinkChip, WidgetCard } from "./styles";
import { GitHubIcon } from "@/utils/icons";
import { ExternalLinkIcon } from "lucide-react";

type GitHubContributionAccount = {
  username: string;
  contributionCountPastYear: number;
  followerCount: number;
  totalStarsReceived: number;
  profileUrl: string;
};

type GitHubContributionsApiResponse = {
  accounts: GitHubContributionAccount[];
};

type GitHubContributionsApiError = {
  error: string;
};

type GitHubContributionsWidgetProps = {
  usernames?: string[];
};

const DEFAULT_USERNAMES = ["S-Ou", "Rocked03"];

const Header = styled.p`
  align-items: center;
  display: flex;
  gap: 0.5rem;
  font-weight: 600;
`;

const Rows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Row = styled.div`
  align-items: flex-start;
  color: inherit;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(0, 1fr) auto;
`;

const RowIdentity = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const RowLabel = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
`;

const RowValue = styled.span`
  display: block;
  font-size: 0.9rem;
  opacity: 0.88;
`;

const ProfileChip = styled(LinkChip)`
  font-size: 0.75rem;
  width: fit-content;
`;

const RowStats = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  text-align: right;
`;

const RowSkeleton = styled.div`
  align-items: center;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(0, 1fr) auto;
`;

const UsernameSkeleton = styled(Skeleton)`
  display: block;
  width: 7rem;

  &:empty {
    height: 0.95rem;
  }
`;

const CountSkeleton = styled(Skeleton)`
  display: block;
  width: 8rem;

  &:empty {
    height: 0.95rem;
  }
`;

const ErrorText = styled.p`
  font-size: 0.9rem;
  opacity: 0.8;
`;

function formatContributionCount(count: number): string {
  return `${count.toLocaleString()} contributions in the last year`;
}

function formatFollowerCount(count: number): string {
  return `${count.toLocaleString()} followers`;
}

function formatStarCount(count: number): string {
  return `${count.toLocaleString()} stars`;
}

export default function GitHubContributionsWidget({
  usernames = DEFAULT_USERNAMES,
}: GitHubContributionsWidgetProps) {
  const [accounts, setAccounts] = useState<GitHubContributionAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchContributions() {
      try {
        const usernameList = usernames.join(",");
        const encodedUsernames = encodeURIComponent(usernameList);
        const response = await fetch(
          `/api/github/contributions?usernames=${encodedUsernames}`,
        );
        const payload = (await response.json()) as
          | GitHubContributionsApiResponse
          | GitHubContributionsApiError;

        if (!response.ok) {
          throw new Error(
            "error" in payload
              ? payload.error
              : "Failed to load GitHub contribution counts.",
          );
        }

        if (!isMounted) {
          return;
        }

        const githubPayload = payload as GitHubContributionsApiResponse;
        setAccounts(githubPayload.accounts);
        setError(null);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load GitHub contribution counts.";

        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchContributions();

    return () => {
      isMounted = false;
    };
  }, [usernames]);

  return (
    <WidgetCard>
      {isLoading && (
        <>
          <Rows>
            {Array.from({ length: usernames.length }, (_, index) => (
              <RowSkeleton key={`github-skeleton-${index}`}>
                <UsernameSkeleton />
                <CountSkeleton />
              </RowSkeleton>
            ))}
          </Rows>
        </>
      )}

      {!isLoading && error && <ErrorText>{error}</ErrorText>}

      {!isLoading && !error && (
        <>
          <Header>
            <GitHubIcon size={20} /> GitHub
          </Header>
          <Rows>
            {accounts.map((account) => (
              <Row key={account.username}>
                <RowIdentity>
                  <RowLabel>{account.username}</RowLabel>
                  <ProfileChip
                    href={account.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${account.username} GitHub profile`}
                  >
                    <ExternalLinkIcon size={12} />
                    {account.username} on GitHub
                  </ProfileChip>
                </RowIdentity>
                <RowStats>
                  <RowValue>
                    {formatContributionCount(account.contributionCountPastYear)}
                  </RowValue>
                  <RowValue>
                    {formatFollowerCount(account.followerCount)}
                  </RowValue>
                  <RowValue>
                    {formatStarCount(account.totalStarsReceived)}
                  </RowValue>
                </RowStats>
              </Row>
            ))}
          </Rows>
        </>
      )}
    </WidgetCard>
  );
}
