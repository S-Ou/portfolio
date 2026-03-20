"use client";

import BodyBlockRocked03 from "@/components/bodyBlock/bodyBlockRocked03";
import InfoBlockRocked03 from "@/components/infoBlock/infoBlockRocked03";
import HomeLayout from "@/components/sites/homeLayout";

export default function Rocked03Home() {
  return (
    <HomeLayout
      InfoBlock={InfoBlockRocked03}
      BodyBlock={BodyBlockRocked03}
      copyrightName="Rocked03"
    />
  );
}
