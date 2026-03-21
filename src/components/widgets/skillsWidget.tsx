"use client";

import { useState } from "react";
import styled from "styled-components";
import { SegmentedControl } from "@/components/segmentedControl";
import { Chip, ChipContainer, WidgetCard } from "./styles";
import {
  Languages,
  MonitorCloud,
  Music,
  PencilRuler,
  Puzzle,
} from "lucide-react";

const SegmentedControlRoot = styled(SegmentedControl.Root)`
  margin: 0 auto;
`;

const SegmentedControlItem = styled(SegmentedControl.Item)`
  display: flex;
  align-items: center;
`;

const CategoryName = styled.p`
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0.8;
  text-align: center;
`;

const StyledChipContainer = styled(ChipContainer)`
  align-content: flex-start;
  justify-content: center;
  max-width: 300px;
  margin: 0 auto;
  min-height: 4rem;
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
  languages: ["Python", "TypeScript", "C#", "JavaScript", "Java", "SQL"],
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

const skillCategories = {
  languages: "Languages",
  frameworks: "Frameworks",
  infrastructure: "Infrastructure",
  tools: "Tools",
  music: "Music",
};

type SkillView = keyof typeof skillsContent;

function SkillPill({ value, index }: { value: string; index: number }) {
  return <AnimatedSkillPill $index={index}>{value}</AnimatedSkillPill>;
}

export default function SkillsWidget() {
  const [view, setView] = useState<SkillView>("languages");

  return (
    <WidgetCard>
      <SegmentedControlRoot
        value={view}
        onValueChange={(nextView) => setView(nextView as SkillView)}
        aria-label="View mode"
      >
        <SegmentedControlItem value="languages">
          <Languages size={14} />
        </SegmentedControlItem>
        <SegmentedControlItem value="frameworks">
          <Puzzle size={14} />
        </SegmentedControlItem>
        <SegmentedControlItem value="infrastructure">
          <MonitorCloud size={14} />
        </SegmentedControlItem>
        <SegmentedControlItem value="tools">
          <PencilRuler size={14} />
        </SegmentedControlItem>
        <SegmentedControlItem value="music">
          <Music size={14} />
        </SegmentedControlItem>
      </SegmentedControlRoot>

      <CategoryName>{skillCategories[view]}</CategoryName>

      <StyledChipContainer key={view}>
        {skillsContent[view].map((skill, index) => (
          <SkillPill key={skill} value={skill} index={index} />
        ))}
      </StyledChipContainer>
    </WidgetCard>
  );
}
