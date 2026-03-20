"use client";

import BodyBlockSJOu from "@/components/bodyBlock/bodyBlockSJOu";
import InfoBlockSJOu from "@/components/infoBlock/infoBlockSJOu";
import HomeLayout from "@/components/sites/homeLayout";

export default function SJOuHome() {
  return (
    <HomeLayout
      InfoBlock={InfoBlockSJOu}
      BodyBlock={BodyBlockSJOu}
      copyrightName="Samuel Ou"
    />
  );
}
