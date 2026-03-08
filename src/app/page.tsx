"use client";

import BodyBlock from "@/components/bodyBlock";
import { BlockDiv } from "@/components/commonStyles";
import InfoBlock from "@/components/infoBlock";
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


export default function Home() {
  return (
    <MainDiv>
      <InfoBlock />
      <BodyBlock/>
    </MainDiv>
  );
}
