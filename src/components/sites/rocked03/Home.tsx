"use client";

import styled from "styled-components";

const MainDiv = styled.div`
  display: grid;
  gap: 1.25rem;
  grid-template-columns: 300px 1fr;
  height: 100vh;
  margin: 0 auto;
  max-width: 1200px;
  padding: 8rem 1rem;
`;

export default function Rocked03Home() {
  return (
    <MainDiv>
      <h1>Rocked03 - Coming Soon</h1>
      <p>This is a placeholder for the Rocked03 site.</p>
    </MainDiv>
  );
}
