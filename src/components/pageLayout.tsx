"use client";

import Copyright from "@/components/copyright";
import styled from "styled-components";
import { useEffect, useRef, useState, type ComponentType } from "react";
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

const MainDiv = styled.div<{ $vPadding: number }>`
  box-sizing: border-box;
  margin: 0 auto;
  max-width: 1200px;
  min-height: 100vh;
  min-height: 100dvh;
  padding-block: ${({ $vPadding }) => `${$vPadding}px`};
  padding-inline: 1rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ContentGrid = styled.div<{
  $fillRemainingHeight: boolean;
  $vPadding: number;
}>`
  display: grid;
  gap: 1.25rem;
  grid-template-areas:
    "info body"
    "info copyright";
  grid-template-columns: 300px 1fr;
  grid-template-rows: minmax(0, 1fr) auto;

  ${({ $fillRemainingHeight, $vPadding }) =>
    $fillRemainingHeight
      ? `
    min-height: calc(100vh - ${$vPadding * 2}px);
    min-height: calc(100dvh - ${$vPadding * 2}px);
  `
      : `
    min-height: auto;
  `}

  @media (max-width: 768px) {
    align-content: start;
    align-items: start;
    grid-template-areas:
      "name-card"
      "body"
      "info"
      "copyright";
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

  @media (max-width: 768px) {
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
  const contentGridRef = useRef<HTMLDivElement>(null);
  const [vPadding, setVPadding] = useState(128);
  const [fillRemainingHeight, setFillRemainingHeight] = useState(true);

  useEffect(() => {
    const updateLayout = () => {
      const contentGrid = contentGridRef.current;

      if (!contentGrid) {
        return;
      }

      const isMobile = window.innerWidth <= 768;
      const rootFontSize = Number.parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      const rem = Number.isFinite(rootFontSize) ? rootFontSize : 16;
      const minPad = rem;
      const maxPad = rem * 8;

      if (isMobile) {
        setVPadding(minPad);
        setFillRemainingHeight(false);
        return;
      }

      const previousMinHeight = contentGrid.style.minHeight;
      contentGrid.style.minHeight = "auto";
      const minimumMainHeight = contentGrid.scrollHeight;
      contentGrid.style.minHeight = previousMinHeight;

      const viewportHeight = window.innerHeight;

      if (viewportHeight >= minimumMainHeight + maxPad * 2) {
        setVPadding(maxPad);
        setFillRemainingHeight(true);
        return;
      }

      if (viewportHeight >= minimumMainHeight + minPad * 2) {
        setVPadding((viewportHeight - minimumMainHeight) / 2);
        setFillRemainingHeight(false);
        return;
      }

      setVPadding(minPad);
      setFillRemainingHeight(false);
    };

    updateLayout();

    const resizeObserver = new ResizeObserver(() => {
      updateLayout();
    });

    if (contentGridRef.current) {
      resizeObserver.observe(contentGridRef.current);
    }

    window.addEventListener("resize", updateLayout);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, []);

  return (
    <MainDiv $vPadding={vPadding}>
      <ContentGrid
        ref={contentGridRef}
        $fillRemainingHeight={fillRemainingHeight}
        $vPadding={vPadding}
      >
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
      copyrightName="Samuel Ou"
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
      copyrightName="Rocked03"
      showInfoBlockOnMobile={showInfoBlockOnMobile}
    />
  );
}
