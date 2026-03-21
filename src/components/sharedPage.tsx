import { getSite } from "@/lib/site";
import {
  PageLayoutProps,
  Rocked03PageLayout,
  SJOuPageLayout,
} from "./pageLayout";
import SiteWrapper from "./siteWrapper";

export default async function SharedPage({
  BodyContentComponent,
  showInfoBlockOnMobile = false,
}: PageLayoutProps) {
  const site = await getSite();

  return (
    <SiteWrapper
      site={site}
      components={{
        sjou: SJOuPageLayout,
        rocked03: Rocked03PageLayout,
      }}
      componentProps={{
        BodyContentComponent,
        showInfoBlockOnMobile,
      }}
    />
  );
}
