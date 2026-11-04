import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { isPublishedSlug } from "@/lib/data/slugs";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /**
   * A quick redirect for visitors with no session cookie, so they never see the admin shell.
   * This only checks that a cookie exists. Real checks run on the server in each page and API.
   */
  if (pathname.startsWith("/admin")) {
    if (pathname !== "/admin/login" && !getSessionCookie(request)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  /**
   * Case-study and service pages are prerendered and streamed, which fixes the status at 200
   * before notFound() can run. Unknown slugs are caught here so they return a real 404.
   */
  const [, section, slug] = pathname.split("/");
  try {
    if (await isPublishedSlug(section as "work" | "services", slug)) return NextResponse.next();
  } catch {
    // Database unreachable: let the page handle it rather than 404 every page
    return NextResponse.next();
  }

  // No route matches this path, so Next renders the root not-found page with a 404 status
  return NextResponse.rewrite(new URL("/page-not-found", request.url));
}

export const config = {
  matcher: ["/work/:slug", "/services/:slug", "/admin/:path*"],
};
