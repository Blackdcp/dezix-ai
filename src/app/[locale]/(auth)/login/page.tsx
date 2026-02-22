"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(t("loginError"));
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] px-4">
      <motion.div
        className="w-full max-w-md rounded-2xl bg-white p-10 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="mb-6 text-center">
          <Link href="/" className="text-2xl font-bold text-[#007AFF]">
            Dezix AI
          </Link>
          <h1 className="mt-4 text-xl font-bold text-[#1d1d1f]">{t("loginTitle")}</h1>
          <p className="mt-1 text-[15px] text-[#86868b]">{t("loginSubtitle")}</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-[#1d1d1f]">
              {t("email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="flex h-12 w-full rounded-xl border-0 bg-[#f5f5f7] px-3 py-2 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-[#1d1d1f]">
              {t("password")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="flex h-12 w-full rounded-xl border-0 bg-[#f5f5f7] px-3 py-2 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
          <button
            type="submit"
            className="btn-primary flex h-12 w-full items-center justify-center rounded-full text-base font-medium disabled:opacity-50"
            disabled={loading}
          >
            {loading ? t("loggingIn") : t("loginButton")}
          </button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#d2d2d7]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-[#86868b]">{t("orLoginWith")}</span>
          </div>
        </div>
        <OAuthButtons mode="login" />
        <div className="mt-4 text-center text-sm text-[#86868b]">
          {t("noAccount")}{" "}
          <Link href="/register" className="text-[#007AFF] hover:underline">
            {t("register")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
