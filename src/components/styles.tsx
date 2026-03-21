import styled from "styled-components";

export const BlockDiv = styled.div`
  background: var(--foreground);
  border-radius: var(--corner-radius);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
  padding: var(--corner-radius);

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const CardsContainer = styled.div`
  column-count: 2;
  column-gap: 1.5rem;

  > * {
    break-inside: avoid;
    margin-bottom: 1.5rem;
    width: 100%;
  }

  @media (max-width: 768px) {
    column-count: 1;

    > * {
      margin-bottom: 1rem;
    }
  }
`;
