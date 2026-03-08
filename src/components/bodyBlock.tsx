import styled from "styled-components";
import { BlockDiv } from "./commonStyles";
import NavMenu from "./navigationMenu";

const BodyDiv = styled(BlockDiv)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export default function BodyBlock() {
  return (
    <BodyDiv>
      <NavMenu />
    </BodyDiv>
  );
}
