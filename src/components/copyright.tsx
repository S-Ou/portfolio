import styled from "styled-components";
import { BlockDiv } from "./styles";

const CopyrightBlock = styled(BlockDiv)`
  color: rgba(var(--text-color-rgb), 0.75);
  display: flex;
  flex-direction: column;
  font-weight: 300;
  gap: 1rem;
`;

export default function Copyright({ name }: { name: string }) {
  return (
    <CopyrightBlock>
      &copy; {new Date().getFullYear()} {name}. All rights reserved.
    </CopyrightBlock>
  );
}
