import SiteWrapper from "@/components/SiteWrapperRename";
import Rocked03NotFound from "@/components/sites/rocked03/NotFound";
import SJOuNotFound from "@/components/sites/sjou/NotFound";
import { getSite } from "@/lib/site";

export default async function NotFound() {
  const site = await getSite();

  return (
    <SiteWrapper
      site={site}
      components={{
        sjou: SJOuNotFound,
        rocked03: Rocked03NotFound,
      }}
    />
  );
}
