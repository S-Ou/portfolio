"use client";

import { SiteType } from "@/lib/site";
import { ComponentType } from "react";

type SiteComponents = {
  [K in SiteType]?: ComponentType<any>;
};

export default function SiteWrapper({
  site,
  components,
  fallback,
}: {
  site: SiteType;
  components: SiteComponents;
  fallback?: ComponentType<any>;
}) {
  const Component = components[site];

  if (!Component) {
    if (fallback) {
      const Fallback = fallback;
      return <Fallback key={site} />;
    }
    return <div>Page not available for this site.</div>;
  }

  return <Component key={site} />;
}
