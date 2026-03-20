"use client";

import BodyBlockSJOu from "@/components/bodyBlock/bodyBlockSJOu";
import InfoBlockSJOu from "@/components/infoBlock/infoBlockSJOu";
import NameCard from "@/components/nameCard";
import HomeLayout from "@/components/sites/homeLayout";

function SJOuNameCard() {
  return (
    <NameCard
      profileImageUrl="/profile-sjou.jpg"
      name="Samuel Ou"
      subtitle="Software Engineer"
    />
  );
}

export default function SJOuHome() {
  return (
    <HomeLayout
      InfoBlock={InfoBlockSJOu}
      BodyBlock={BodyBlockSJOu}
      NameCardComponent={SJOuNameCard}
      copyrightName="Samuel Ou"
    />
  );
}
