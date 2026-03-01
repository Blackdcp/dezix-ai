import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Skip API routes entirely — no locale processing needed
  // Use "/api/" (with slash) to avoid matching page routes like /api-keys
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // IP-based locale detection for first-time visitors (no cookie set)
  const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;
  if (!cookieLocale) {
    const country = req.headers.get("x-vercel-ip-country");
    const detectedLocale = country === "CN" ? "zh" : "en";

    // Check if URL already has a locale prefix
    const hasLocalePrefix = routing.locales.some(
      (l) =>
        l !== routing.defaultLocale &&
        (pathname.startsWith(`/${l}/`) || pathname === `/${l}`)
    );

    if (!hasLocalePrefix && detectedLocale !== routing.defaultLocale) {
      // Non-default locale detected, redirect to prefixed URL
      const url = req.nextUrl.clone();
      url.pathname = `/${detectedLocale}${pathname}`;
      const response = NextResponse.redirect(url);
      response.cookies.set("NEXT_LOCALE", detectedLocale, {
        maxAge: 365 * 24 * 60 * 60,
        path: "/",
      });
      return response;
    }

    // Default locale (zh for CN) — run intl middleware and set cookie
    const response = intlMiddleware(req as unknown as NextRequest);
    response.cookies.set("NEXT_LOCALE", detectedLocale, {
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });
    return response;
  }

  return intlMiddleware(req as unknown as NextRequest);
});

export const config = {
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico).*)"],
};
