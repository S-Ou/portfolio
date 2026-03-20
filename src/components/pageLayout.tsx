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
  height: 100vh;
  margin: 0 auto;
  max-width: 1200px;
  padding: 8rem 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
`;

const MobileNameCardBlock = styled(BlockDiv)`
  display: none;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-height: 0;

  @media (max-width: 768px) {
    display: contents;
  }
`;

const BodySection = styled.div`
  height: 100%;

  @media (max-width: 768px) {
    order: 1;
  }
`;

const InfoSection = styled.div<{ $showOnMobile: boolean }>`
  @media (max-width: 768px) {
    display: ${({ $showOnMobile }) => ($showOnMobile ? "block" : "none")};
    order: 2;
  }
`;

const CopyrightSection = styled.div`
  @media (max-width: 768px) {
    order: 3;
  }
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
      <RightColumn>
        <BodySection>
          <BodyBlock NavigationComponent={NavigationComponent}>
            <BodyContentComponent />
          </BodyBlock>
        </BodySection>
        <CopyrightSection>
          <Copyright name={copyrightName} />
        </CopyrightSection>
      </RightColumn>
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
