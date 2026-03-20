"use client";

import Copyright from "@/components/copyright";
import styled from "styled-components";
import type { ComponentType } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

type HomeLayoutProps = {
  InfoBlock: ComponentType;
  BodyBlock: ComponentType;
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
  copyrightName,
}: HomeLayoutProps) {
  var isMobile = useIsMobile();

  return (
    <MainDiv>
      <InfoBlock />
      <RightColumn>
        <BodyBlock />
        <Copyright name={copyrightName} />
      </RightColumn>
    </MainDiv>
  );
}
