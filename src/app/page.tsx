"use client";

import { getSite } from "@/lib/site";
import SJOuHome from "@/components/sites/sjou/Home";
import Rocked03Home from "@/components/sites/rocked03/Home";

export default function Home() {
  const site = getSite();

  switch (site) {
    case "rocked03":
      return <Rocked03Home />;
    case "sjou":
      return <SJOuHome />;
    default:
      return <></>;
  }
}
