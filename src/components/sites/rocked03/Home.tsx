"use client";

import BodyBlockRocked03 from "@/components/bodyBlock/bodyBlockRocked03";
import InfoBlockRocked03 from "@/components/infoBlock/infoBlockRocked03";
import NameCard from "@/components/nameCard";
import HomeLayout from "@/components/sites/homeLayout";

function Rocked03NameCard() {
  return <NameCard profileImageUrl="/profile-rocked03.png" name="Rocked03" />;
}

export default function Rocked03Home() {
  return (
    <HomeLayout
      InfoBlock={InfoBlockRocked03}
      BodyBlock={BodyBlockRocked03}
      NameCardComponent={Rocked03NameCard}
      copyrightName="Rocked03"
    />
  );
}
