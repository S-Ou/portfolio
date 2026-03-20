"use client";

import Copyright from "@/components/copyright";
import styled from "styled-components";
import type { ComponentType } from "react";
import type { InfoBlockProps } from "@/components/infoBlock/infoBlock";
import { BlockDiv } from "@/components/commonStyles";
import { BodyBlock } from "@/components/bodyBlock";
import InfoBlockSJOu from "./infoBlock/infoBlockSJOu";
import { Rocked03NameCard, SJOuNameCard } from "./nameCard";
import { NavMenuRocked03, NavMenuSJOu } from "./navigationMenu";
import InfoBlockRocked03 from "./infoBlock/infoBlockRocked03";

type HomeLayoutProps = {
  InfoBlock: ComponentType<InfoBlockProps>;
  BodyContentComponent: ComponentType;
  NavigationComponent: ComponentType;
  NameCardComponent: ComponentType;
  copyrightName: string;
  showInfoBlockOnMobile?: boolean;
};

const MainDiv = styled.div`
  display: grid;
  gap: 1.25rem;
  grid-template-columns: 300px 1fr;
  grid-template-rows: minmax(0, 1fr) auto;
  grid-template-areas:
    "info body"
    "info copyright";
  min-height: 100vh;
  min-height: 100dvh;
  margin: 0 auto;
  max-width: 1200px;
  padding: 8rem 1rem;

  @media (max-width: 768px) {
    align-content: start;
    align-items: start;
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    grid-template-areas:
      "name-card"
      "body"
      "info"
      "copyright";
    padding: 1rem;
  }
`;

const MobileNameCardBlock = styled(BlockDiv)`
  display: none;
  grid-area: name-card;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const BodySection = styled.div`
  flex: 1;
  grid-area: body;
  min-height: 0;

  @media (max-width: 768px) {
    flex: initial;
    min-height: auto;
  }
`;

const InfoSection = styled.div<{ $showOnMobile: boolean }>`
  grid-area: info;

  @media (max-width: 768px) {
    display: ${({ $showOnMobile }) => ($showOnMobile ? "block" : "none")};
  }
`;

const CopyrightSection = styled.div`
  grid-area: copyright;
`;

function PageLayout({
  InfoBlock,
  BodyContentComponent,
  NavigationComponent,
  NameCardComponent,
  copyrightName,
  showInfoBlockOnMobile = false,
}: HomeLayoutProps) {
  return (
    <MainDiv>
      <MobileNameCardBlock>
        <NameCardComponent />
      </MobileNameCardBlock>
      <InfoSection $showOnMobile={showInfoBlockOnMobile}>
        <InfoBlock NameCardComponent={NameCardComponent} />
      </InfoSection>
      <BodySection>
        <BodyBlock NavigationComponent={NavigationComponent}>
          <BodyContentComponent />
        </BodyBlock>
      </BodySection>
      <CopyrightSection>
        <Copyright name={copyrightName} />
      </CopyrightSection>
    </MainDiv>
  );
}

export function SJOuPageLayout({
  BodyContentComponent,
  showInfoBlockOnMobile = false,
}: {
  BodyContentComponent: ComponentType;
  showInfoBlockOnMobile?: boolean;
}) {
  return (
    <PageLayout
      InfoBlock={InfoBlockSJOu}
      BodyContentComponent={BodyContentComponent}
      NavigationComponent={NavMenuSJOu}
      NameCardComponent={SJOuNameCard}
      copyrightName="Samuel Ou"
      showInfoBlockOnMobile={showInfoBlockOnMobile}
    />
  );
}

export function Rocked03PageLayout({
  BodyContentComponent,
  showInfoBlockOnMobile = false,
}: {
  BodyContentComponent: ComponentType;
  showInfoBlockOnMobile?: boolean;
}) {
  return (
    <PageLayout
      InfoBlock={InfoBlockRocked03}
      BodyContentComponent={BodyContentComponent}
      NavigationComponent={NavMenuRocked03}
      NameCardComponent={Rocked03NameCard}
      copyrightName="Rocked03"
      showInfoBlockOnMobile={showInfoBlockOnMobile}
    />
  );
}
