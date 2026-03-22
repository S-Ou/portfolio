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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum
          tincidunt rutrum dolor, non pulvinar nunc facilisis non. Vivamus vitae
          elit dui. Nullam efficitur fermentum nunc, id volutpat odio cursus
          non. In hac habitasse platea dictumst. Vivamus euismod tellus tempor
          nunc congue ultricies. Sed faucibus fermentum dolor, vel pulvinar nunc
          fermentum non. Donec et laoreet augue, sit amet finibus tortor. Donec
          luctus pulvinar tortor, vitae aliquam felis sollicitudin nec.
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
