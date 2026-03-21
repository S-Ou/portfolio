import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") || "";

  // Determine which site based on hostname or environment variable
  let site = "sjou";

  // In development, prioritize environment variable
  if (process.env.NEXT_PUBLIC_SITE) {
    site = process.env.NEXT_PUBLIC_SITE;
  }
  // In production, use hostname
  else if (hostname.includes("rocked03.dev")) {
    site = "rocked03";
  } else if (hostname.includes("sjou.dev")) {
    site = "sjou";
  }

  // Clone the request headers and add the site
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-site", site);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Also set it as a response header for client-side access
  response.headers.set("x-site", site);

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon).*)"],
};
