import styled from "styled-components";
import { BlockDiv } from "../commonStyles";
import type { ComponentType } from "react";

export type InfoBlockProps = {
  NameCardComponent: ComponentType;
};

export const InfoBlockDiv = styled(BlockDiv)`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
`;

export const StyledInfoTable = styled.table`
  border-collapse: separate;
  border-spacing: 0.5rem 0.5rem;
  margin: -1rem -1rem;
  width: 100%;

  td {
    vertical-align: middle;
  }

  td:first-child {
    align-items: center;
    display: flex;
    justify-content: center;
    height: 2rem;
  }
`;

export const StyledLinkButtons = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const StyledLinkButton = styled.a`
  aspect-ratio: 1 / 1;
  display: flex;
`;

export function LinkButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <StyledLinkButton href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </StyledLinkButton>
  );
}
