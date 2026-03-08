import { headers } from "next/headers";

export type SiteType = "sjou" | "rocked03";

/**
 * Gets the current site based on middleware headers or environment variable
 */
export async function getSite(): Promise<SiteType> {
  // Server-side: check headers set by middleware
  if (typeof window === "undefined") {
    try {
      const headersList = await headers();
      const site = headersList.get("x-site") as SiteType;
      if (site) return site;
    } catch (e) {
      // headers() not available in this context
    }

    // Fallback to environment variable
    if (process.env.NEXT_PUBLIC_SITE === "rocked03") {
      return "rocked03";
    }
  }

  // Client-side: check hostname
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname.includes("rocked03.dev")) {
      return "rocked03";
    }
  }

  return "sjou";
}
