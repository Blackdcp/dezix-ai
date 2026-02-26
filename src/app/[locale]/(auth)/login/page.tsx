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

  const inputClass = "flex h-11 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F8F6] px-4">
      <div className="pointer-events-none fixed inset-0 dot-grid opacity-40" />
      <motion.div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-white p-10 shadow-xl shadow-black/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="absolute inset-x-0 top-0 h-1 gradient-brand" />
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="font-heading text-xl font-bold text-gradient-brand">Dezix AI</span>
          </Link>
          <h1 className="font-heading mt-6 text-2xl font-bold text-foreground">{t("loginTitle")}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{t("loginSubtitle")}</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              {t("email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              {t("password")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            className="btn-primary flex h-11 w-full items-center justify-center text-sm font-medium disabled:opacity-50"
            disabled={loading}
          >
            {loading ? t("loggingIn") : t("loginButton")}
          </button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-[#A8A29E]">{t("orLoginWith")}</span>
          </div>
        </div>
        <OAuthButtons mode="login" />
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {t("noAccount")}{" "}
          <Link href="/register" className="font-medium text-primary hover:text-accent-brand-hover">
            {t("register")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
