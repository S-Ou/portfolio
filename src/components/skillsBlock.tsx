import { useState } from "react";
import styled from "styled-components";
import { SegmentedControl } from "./segmentedControl";

const StyledSkillsBlock = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 0 auto;
  width: fit-content;
`;

const SkillPillContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  max-width: 300px;
`;

const StyledSkillPill = styled.div<{ $index: number }>`
  background-color: var(--background);
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  animation: fadeIn 750ms ease-out forwards;
  animation-delay: ${({ $index }) => ($index + 1) * 75}ms;
  opacity: 0;

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
`;

const skillsContent = {
  languages: ["Python", "JavaScript", "TypeScript", "Java", "C#", "SQL"],
  frameworks: ["React", "Next.js", "Express", "discord.py"],
  infrastructure: [
    "PostgreSQL",
    "MongoDB",
    "Docker",
    "Kubernetes",
    "Azure",
    "Git",
  ],
  tools: ["Figma", "Photoshop", "After Effects", "Premiere Pro", "Audacity"],
  music: ["Alto Saxophone", "Baritone Saxophone", "Soprano Saxophone", "Piano"],
};

function SkillPill({ value, index }: { value: string; index: number }) {
  return <StyledSkillPill $index={index}>{value}</StyledSkillPill>;
}

export default function SkillsBlock() {
  const [view, setView] = useState("languages");

  return (
    <StyledSkillsBlock>
      <SegmentedControl.Root
        value={view}
        onValueChange={setView}
        aria-label="View mode"
      >
        <SegmentedControl.Item value="languages">
          Languages
        </SegmentedControl.Item>
        <SegmentedControl.Item value="frameworks">
          Frameworks
        </SegmentedControl.Item>
        <SegmentedControl.Item value="infrastructure">
          Infrastructure
        </SegmentedControl.Item>
        <SegmentedControl.Item value="tools">Tools</SegmentedControl.Item>
        <SegmentedControl.Item value="music">Music</SegmentedControl.Item>
      </SegmentedControl.Root>

      <SkillPillContainer key={view}>
        {skillsContent[view as keyof typeof skillsContent].map(
          (skill, index) => (
            <SkillPill key={skill} value={skill} index={index} />
          ),
        )}
      </SkillPillContainer>
    </StyledSkillsBlock>
  );
}
