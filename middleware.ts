import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight middleware — protects /organiser/dashboard and /organiser/scanner
// Real verification happens server-side via JWT; here we just check token existence for redirect speed
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/organiser/dashboard") || pathname.startsWith("/organiser/scanner")) {
    const token = req.cookies.get("organiser_token")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/organiser/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/organiser/dashboard/:path*", "/organiser/scanner/:path*"],
};
