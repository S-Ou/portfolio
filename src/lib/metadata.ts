import { Metadata } from "next";
import { SiteType } from "./site";

export const siteMetadata: Record<SiteType, Metadata> = {
  sjou: {
    title: "Samuel Ou",
    description: "Samuel Ou",
    icons: {
      icon: "/favicon-sjou.ico",
    },
  },
  rocked03: {
    title: "Rocked03",
    description: "Rocked03",
    icons: {
      icon: "/favicon-rocked03.ico",
    },
  },
};

export function getMetadata(site: SiteType): Metadata {
  return siteMetadata[site];
}
