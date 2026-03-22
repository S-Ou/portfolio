"use client";

import {
  BodyTextBlock,
  BodyTextHeader,
  BodyText,
} from "@/components/bodyBlock";
import { CardsContainer } from "@/components/styles";
import { Rocked03PageLayout } from "@/components/pageLayout";
import {
  DiscordServerWidget,
  GitHubContributionsWidget,
  LetterboxdDiaryWidget,
  MarvelRivalsStatsWidget,
  SteamGamesWidget,
} from "@/components/widgets";

function HomeBodyRocked03() {
  return (
    <>
      <BodyTextBlock>
        <BodyTextHeader>Hi, I&apos;m Rocked.</BodyTextHeader>
        <BodyText>
          <p>
            I'm a professional software developer from Auckland, New Zealand.
          </p>
          <p>
            I enjoy pop-culture movies, shows, comics, etc., and you can often
            find me in online fandom spaces for Marvel and other franchises. I
            also help manage the Marvel Discord server, and you can find many
            Discord-related projects in <u>Projects</u>.
          </p>
          <p>
            I'm also a casual but avid saxophonist! I'll also find any excuse to
            have a gaming sesh with friends.
          </p>
        </BodyText>
      </BodyTextBlock>
      <CardsContainer>
        <DiscordServerWidget />
        <GitHubContributionsWidget usernames={["Rocked03"]} />
        <SteamGamesWidget />
        <LetterboxdDiaryWidget />
        <MarvelRivalsStatsWidget />
      </CardsContainer>
    </>
  );
}

export default function Rocked03Home() {
  return (
    <Rocked03PageLayout
      BodyContentComponent={HomeBodyRocked03}
      showInfoBlockOnMobile
    />
  );
}
