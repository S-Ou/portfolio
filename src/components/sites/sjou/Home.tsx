"use client";

import { SJOuPageLayout } from "@/components/pageLayout";
import {
  BodyTextBlock,
  BodyTextHeader,
  BodyText,
} from "@/components/bodyBlock";
import {
  GitHubContributionsWidget,
  LetterboxdDiaryWidget,
  SkillsWidget,
} from "@/components/widgets";
import { CardsContainer } from "@/components/styles";
import Link from "next/link";

const calculateYearsSince = (date: Date): number =>
  Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365));

function HomeBodySJOu() {
  var myAge = calculateYearsSince(new Date(2003, 2, 16)); // Months index at 0?!?
  var saxophoneYears = calculateYearsSince(new Date(2014, 1));

  return (
    <>
      <BodyTextBlock>
        <BodyTextHeader>Hi, I&apos;m Samuel.</BodyTextHeader>
        <BodyText>
          <p>
            I'm a {myAge}-year-old software engineer from Auckland, New Zealand.
          </p>
          <p>
            I currently develop back-end code at Vista Group. Outside of work,
            you can still find me coding various hobby projects, which you can
            check out in <Link href="/projects">Projects</Link>.
          </p>
          <p>
            I'm an avid musician, having played the saxophone for{" "}
            {saxophoneYears} years with many different bands and orchestras.
          </p>
          <p>
            I love movies and TV shows, and you can often catch me in the cinema
            &ndash; I especially enjoy Marvel and other pop-culture franchises.
          </p>
        </BodyText>
      </BodyTextBlock>
      <CardsContainer>
        <SkillsWidget />
        <GitHubContributionsWidget usernames={["S-Ou", "Rocked03"]} />
        <LetterboxdDiaryWidget />
      </CardsContainer>
    </>
  );
}

export default function SJOuHome() {
  return (
    <SJOuPageLayout BodyContentComponent={HomeBodySJOu} showInfoBlockOnMobile />
  );
}
