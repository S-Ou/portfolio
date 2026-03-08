import styled from "styled-components";
import { BlockDiv } from "../commonStyles";

export const BodyDiv = styled(BlockDiv)`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 1rem;
`;

export const BodyTextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 5rem 0rem;
`;

export const BodyTextHeader = styled.h1`
  font-size: 2rem;
`;

export const BodyText = styled.p`
  font-size: 1.25rem;
  line-height: 1.5;
`;
