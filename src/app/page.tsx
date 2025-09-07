"use client";

import { Github } from "lucide-react";
import styled from "styled-components";

const MainDiv = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  height: 100vh;
  justify-content: center;
`;

const Header = styled.h1`
  font-size: 3rem;
  font-weight: 800;
`;

const Link = styled.a`
  color: inherit;
  text-decoration: none;
  font-size: 0.875rem;

  &:hover {
    text-decoration: underline;
  }
`;

export default function Home() {
  return (
    <MainDiv>
      <Header>Under construction...</Header>
      <Link
        href="https://github.com/S-Ou"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Github size={24} />
      </Link>
    </MainDiv>
  );
}
