"use client";

import BodyBlockSJOu from "@/components/bodyBlock/bodyBlockSJOu";
import InfoBlockSJOu from "@/components/infoBlock/infoBlockSJOu";
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

export default function SJOuHome() {
  return (
    <MainDiv>
      <InfoBlockSJOu />
      <BodyBlockSJOu />
    </MainDiv>
  );
}
