"use client";

import Copyright from "@/components/copyright";
import styled from "styled-components";
import type { ComponentType } from "react";
import type { InfoBlockProps } from "@/components/infoBlock/infoBlock";
import { BlockDiv } from "@/components/commonStyles";

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

const InfoSection = styled.div`
  @media (max-width: 768px) {
    order: 2;
  }
`;

const CopyrightSection = styled.div`
  @media (max-width: 768px) {
    order: 3;
  }
`;

export default function HomeLayout({
  InfoBlock,
  BodyBlock,
  NameCardComponent,
  copyrightName,
}: HomeLayoutProps) {
  return (
    <MainDiv>
      <MobileNameCardBlock>
        <NameCardComponent />
      </MobileNameCardBlock>
      <InfoSection>
        <InfoBlock NameCardComponent={NameCardComponent} />
      </InfoSection>
      <RightColumn>
        <BodySection>
          <BodyBlock />
        </BodySection>
        <CopyrightSection>
          <Copyright name={copyrightName} />
        </CopyrightSection>
      </RightColumn>
    </MainDiv>
  );
}
