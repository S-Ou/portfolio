import { getSite } from "@/lib/site";
import SiteWrapper from "@/components/SiteWrapper";
import SJOuHome from "@/components/sites/sjou/Home";
import Rocked03Home from "@/components/sites/rocked03/Home";

export default async function Home() {
  const site = await getSite();

  return (
    <SiteWrapper
      site={site}
      components={{
        sjou: SJOuHome,
        rocked03: Rocked03Home,
      }}
    />
  );
}
