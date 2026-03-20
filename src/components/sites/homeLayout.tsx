"use client";

import Copyright from "@/components/copyright";
import styled from "styled-components";
import type { ComponentType } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { InfoBlockProps } from "@/components/infoBlock/infoBlock";

type HomeLayoutProps = {
  InfoBlock: ComponentType<InfoBlockProps>;
  BodyBlock: ComponentType;
  NameCardComponent: ComponentType;
  copyrightName: string;
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

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-height: 0;
`;

export default function HomeLayout({
  InfoBlock,
  BodyBlock,
  NameCardComponent,
  copyrightName,
}: HomeLayoutProps) {
  return (
    <MainDiv>
      <InfoBlock NameCardComponent={NameCardComponent} />
      <RightColumn>
        <BodyBlock />
        <Copyright name={copyrightName} />
      </RightColumn>
    </MainDiv>
  );
}
