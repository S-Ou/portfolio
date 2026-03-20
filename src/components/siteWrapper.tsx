"use client";

import { SiteType } from "@/lib/site";
import { useRouter } from "next/navigation";
import { ComponentType, useEffect } from "react";

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
  const router = useRouter();
  const Component = components[site];

  useEffect(() => {
    if (!Component && !fallback) {
      router.replace("/404");
    }
  }, [Component, fallback, router]);

  if (!Component) {
    if (fallback) {
      const Fallback = fallback;
      return <Fallback key={site} />;
    }
    return null;
  }

  return <Component key={site} />;
}
