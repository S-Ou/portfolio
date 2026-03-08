import styled from "styled-components";
import { BlockDiv } from "./commonStyles";
import NavMenu from "./navigationMenu";

const BodyDiv = styled(BlockDiv)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BodyTextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 8rem 0rem;
`;

const BodyTextHeader = styled.h1`
  font-size: 2rem;
`;

const BodyText = styled.p`
  font-size: 1.25rem;
  line-height: 1.5;
`;

export default function BodyBlock() {
  return (
    <BodyDiv>
      <NavMenu />
      <BodyTextBlock>
        <BodyTextHeader>Hi, I'm Samuel.</BodyTextHeader>
        <BodyText>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum
          tincidunt rutrum dolor, non pulvinar nunc facilisis non. Vivamus vitae
          elit dui. Nullam efficitur fermentum nunc, id volutpat odio cursus
          non. In hac habitasse platea dictumst. Vivamus euismod tellus tempor
          nunc congue ultricies. Sed faucibus fermentum dolor, vel pulvinar nunc
          fermentum non. Donec et laoreet augue, sit amet finibus tortor. Donec
          luctus pulvinar tortor, vitae aliquam felis sollicitudin nec.
        </BodyText>
      </BodyTextBlock>
    </BodyDiv>
  );
}
