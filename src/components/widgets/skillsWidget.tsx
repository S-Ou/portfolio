"use client";

import { useState } from "react";
import styled from "styled-components";
import { SegmentedControl } from "@/components/segmentedControl";
import { Chip, ChipContainer, WidgetCard } from "./styles";

const StyledChipContainer = styled(ChipContainer)`
  justify-content: center;
  max-width: 300px;
  margin: 0 auto;
`;

const AnimatedSkillPill = styled(Chip)<{ $index: number }>`
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
} as const;

type SkillView = keyof typeof skillsContent;

function SkillPill({ value, index }: { value: string; index: number }) {
  return <AnimatedSkillPill $index={index}>{value}</AnimatedSkillPill>;
}

export default function SkillsWidget() {
  const [view, setView] = useState<SkillView>("languages");

  return (
    <WidgetCard>
      <SegmentedControl.Root
        value={view}
        onValueChange={(nextView) => setView(nextView as SkillView)}
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

      <StyledChipContainer key={view}>
        {skillsContent[view].map((skill, index) => (
          <SkillPill key={skill} value={skill} index={index} />
        ))}
      </StyledChipContainer>
    </WidgetCard>
  );
}
