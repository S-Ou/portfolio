"use client";

import BodyBlockRocked03 from "@/components/bodyBlock/bodyBlockRocked03";
import InfoBlockRocked03 from "@/components/infoBlock/infoBlockRocked03";
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
      <InfoBlockRocked03 />
      <BodyBlockRocked03 />
    </MainDiv>
  );
}
