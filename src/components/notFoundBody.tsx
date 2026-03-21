"use client";

import styled from "styled-components";

const NotFoundStyled = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  padding-top: 5rem;
  padding-bottom: 10rem;

  h1 {
    font-size: 7rem;
    font-weight: 1000;
  }

  h2 {
    font-size: 2rem;
    font-weight: 600;
  }
`;

export default function NotFoundBody() {
  return (
    <NotFoundStyled>
      <h1>404</h1>
      <h2>Not Found</h2>
    </NotFoundStyled>
  );
}
