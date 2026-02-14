import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/api-keys",
  "/usage",
  "/models",
  "/playground",
  "/chat",
  "/billing",
  "/settings",
  "/referral",
  "/admin",
];

const authPaths = ["/login", "/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // 已登录用户访问登录/注册页 → 跳转到仪表盘
  if (isLoggedIn && authPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 未登录用户访问受保护页面 → 跳转到登录页
  if (!isLoggedIn && protectedPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 非 ADMIN 用户访问 /admin/* → 跳转到仪表盘
  if (isLoggedIn && pathname.startsWith("/admin")) {
    const role = req.auth?.user?.role;
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
