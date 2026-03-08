export type SiteType = "sjou" | "rocked03";

/**
 * Gets the current site based on environment variable or hostname
 */
export function getSite(): SiteType {
  // In development, use environment variable
  if (process.env.NEXT_PUBLIC_SITE === "rocked03") {
    return "rocked03";
  }

  // In production, check hostname (server-side)
  if (typeof window === "undefined") {
    // Will be set by middleware
    return (process.env.NEXT_PUBLIC_SITE as SiteType) || "sjou";
  }

  // Client-side fallback
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname.includes("rocked03.dev")) {
      return "rocked03";
    }
  }

  return "sjou";
}
