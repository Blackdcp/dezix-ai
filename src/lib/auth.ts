import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [GitHub({
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          allowDangerousEmailAccountLinking: true,
        })]
      : []),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          allowDangerousEmailAccountLinking: true,
        })]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        if (user.role) {
          token.role = user.role;
        } else {
          // OAuth users may not have role on the user object; fetch from DB
          const dbUser = await db.user.findUnique({
            where: { id: user.id! },
            select: { role: true },
          });
          token.role = dbUser?.role ?? "USER";
        }
      }
      return token;
    },
  },
  events: {
    async createUser({ user }) {
      // Generate referralCode for OAuth-created users + handle referral
      const referralCode = crypto.randomBytes(4).toString("hex");
      const updateData: { referralCode: string; referredBy?: string } = { referralCode };

      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const refCode = cookieStore.get("dezix_ref")?.value;
        if (refCode) {
          const referrer = await db.user.findFirst({
            where: { referralCode: refCode },
            select: { id: true },
          });
          if (referrer) updateData.referredBy = referrer.id;
          cookieStore.delete("dezix_ref");
        }
      } catch {
        /* cookies() unavailable in some contexts — ignore */
      }

      await db.user.update({
        where: { id: user.id },
        data: updateData,
      });
    },
  },
});
