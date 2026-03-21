import styled from "styled-components";

const CopyrightBlock = styled.span`
  color: rgba(var(--text-color-rgb), 0.5);
  display: flex;
  flex-direction: column;
  font-weight: 300;
  gap: 1rem;
  font-size: 0.75rem;
`;

export default function Copyright({ name }: { name: string }) {
  return (
    <CopyrightBlock>
      &copy; {new Date().getFullYear()} {name}. All rights reserved.
    </CopyrightBlock>
  );
}
