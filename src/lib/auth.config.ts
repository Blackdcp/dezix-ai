import type { NextAuthConfig } from "next-auth";

/**
 * Auth config shared by middleware (Edge runtime) and server.
 * Must NOT import Node.js-only modules (crypto, pg, bcrypt, Prisma).
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [], // Credentials provider added in auth.ts (server-only)
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role ?? "USER";
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

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

      // Logged-in users visiting auth pages → redirect to dashboard
      if (isLoggedIn && authPaths.some((p) => pathname.startsWith(p))) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      // Not logged in visiting protected pages → redirect to login
      if (!isLoggedIn && protectedPaths.some((p) => pathname.startsWith(p))) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      // Non-ADMIN users visiting /admin/* → redirect to dashboard
      if (isLoggedIn && pathname.startsWith("/admin")) {
        const role = auth?.user?.role;
        if (role !== "ADMIN") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
      }

      return true;
    },
  },
};
