import styled from "styled-components";
import { BlockDiv } from "../styles";

export const WidgetCard = styled(BlockDiv)`
  background: rgba(var(--text-color-rgb), 0.02);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: fit-content;
`;

export const Chip = styled.span`
  background: rgba(var(--text-color-rgb), 0.08);
  border-radius: 999px;
  font-size: 0.8rem;
  padding: 0.35rem 0.65rem;
`;

export const LinkChip = styled(Chip).attrs({ as: "a" })`
  align-items: center;
  display: flex;
  gap: 0.25rem;
  transition: background 0.2s;

  &:hover {
    background: rgba(var(--text-color-rgb), 0.14);
  }
`;

export const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;
