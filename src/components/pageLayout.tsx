"use client";

import Copyright from "@/components/copyright";
import styled from "styled-components";
import type { ComponentType } from "react";
import type { InfoBlockProps } from "@/components/infoBlock/infoBlock";
import { BlockDiv } from "@/components/styles";
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
  showInfoBlockOnMobile?: boolean;
};

const MainDiv = styled.div`
  box-sizing: border-box;
  margin: 0 auto;
  max-width: 1200px;
  height: calc(100vh);
  height: calc(100dvh);
  padding-block: 8rem;
  padding-inline: 1rem;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-height: 1200px) {
    padding-block: 1rem;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  gap: 1.25rem;
  grid-template-areas: "info body";
  grid-template-columns: 300px 1fr;
  grid-template-rows: 1fr;
  flex: 1;
  min-height: 0;

  @media (max-width: 768px) {
    align-content: start;
    align-items: start;
    grid-template-areas:
      "name-card"
      "body"
      "info";
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    min-height: auto;
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
  grid-area: body;
  min-height: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    min-height: auto;
    height: auto;
    overflow: auto;
  }
`;

const InfoSection = styled.div<{ $showOnMobile: boolean }>`
  grid-area: info;

  @media (max-width: 768px) {
    display: ${({ $showOnMobile }) => ($showOnMobile ? "block" : "none")};
  }
`;

function PageLayout({
  InfoBlock,
  BodyContentComponent,
  NavigationComponent,
  NameCardComponent,
  showInfoBlockOnMobile = false,
}: HomeLayoutProps) {
  return (
    <MainDiv>
      <ContentGrid>
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
      </ContentGrid>
    </MainDiv>
  );
}

export interface PageLayoutProps {
  BodyContentComponent: ComponentType;
  showInfoBlockOnMobile?: boolean;
}

export function SJOuPageLayout({
  BodyContentComponent,
  showInfoBlockOnMobile = false,
}: PageLayoutProps) {
  return (
    <PageLayout
      InfoBlock={InfoBlockSJOu}
      BodyContentComponent={BodyContentComponent}
      NavigationComponent={NavMenuSJOu}
      NameCardComponent={SJOuNameCard}
      showInfoBlockOnMobile={showInfoBlockOnMobile}
    />
  );
}

export function Rocked03PageLayout({
  BodyContentComponent,
  showInfoBlockOnMobile = false,
}: PageLayoutProps) {
  return (
    <PageLayout
      InfoBlock={InfoBlockRocked03}
      BodyContentComponent={BodyContentComponent}
      NavigationComponent={NavMenuRocked03}
      NameCardComponent={Rocked03NameCard}
      showInfoBlockOnMobile={showInfoBlockOnMobile}
    />
  );
}
