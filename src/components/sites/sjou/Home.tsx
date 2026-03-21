"use client";

import { SJOuPageLayout } from "@/components/pageLayout";
import {
  BodyTextBlock,
  BodyTextHeader,
  BodyText,
} from "@/components/bodyBlock";
import SkillsBlock from "@/components/skillsBlock";

function HomeBodySJOu() {
  return (
    <>
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
      <SkillsBlock />
    </>
  );
}

export default function SJOuHome() {
  return (
    <SJOuPageLayout BodyContentComponent={HomeBodySJOu} showInfoBlockOnMobile />
  );
}
