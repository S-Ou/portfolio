import ProjectsSJOu from "@/components/sites/sjou/Projects";
import SiteWrapper from "@/components/siteWrapper";
import { getSite } from "@/lib/site";

export default async function Projects() {
  const site = await getSite();

  return (
    <SiteWrapper
      site={site}
      components={{
        sjou: ProjectsSJOu,
      }}
    />
  );
}
