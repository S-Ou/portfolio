import styled from "styled-components";
import { BlockDiv } from "./styles";
import type { ComponentType } from "react";
import type { ReactNode } from "react";

export type BodyBlockProps = {
  NavigationComponent: ComponentType;
  children: ReactNode;
};

export function BodyBlock({ NavigationComponent, children }: BodyBlockProps) {
  return (
    <BodyDiv>
      <NavigationComponent />
      {children}
    </BodyDiv>
  );
}

export const BodyDiv = styled(BlockDiv)`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 1rem;
  max-height: 100%;
  overflow-y: auto;
`;

export const BodyTextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 4rem 0rem;

  @media (max-width: 768px) {
    padding: 2rem 0rem;
  }
`;

export const BodyTextHeader = styled.h1`
  font-size: 2rem;
`;

export const BodyText = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 1.25rem;
  gap: 1.25rem;
  line-height: 1.5;
`;
