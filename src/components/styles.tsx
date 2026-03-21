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
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;

  > * {
    flex: 0 0 calc((100% - 1.5rem) / 2);
    max-width: calc((100% - 1.5rem) / 2);
  }

  @media (max-width: 768px) {
    flex-direction: column;

    > * {
      flex: 0 0 100%;
      max-width: 100%;
    }
  }
`;
