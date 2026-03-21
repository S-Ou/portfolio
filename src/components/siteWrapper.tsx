"use client";

import { SiteType } from "@/lib/site";
import { useRouter } from "next/navigation";
import { ComponentType, useEffect } from "react";

type SiteComponents<TProps extends object = Record<string, never>> = {
  [K in SiteType]?: ComponentType<TProps>;
};

export default function SiteWrapper<
  TProps extends object = Record<string, never>,
>({
  site,
  components,
  componentProps,
  fallback,
}: {
  site: SiteType;
  components: SiteComponents<TProps>;
  componentProps?: TProps;
  fallback?: ComponentType<TProps>;
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
      return <Fallback key={site} {...(componentProps ?? ({} as TProps))} />;
    }
    return null;
  }

  return <Component key={site} {...(componentProps ?? ({} as TProps))} />;
}
