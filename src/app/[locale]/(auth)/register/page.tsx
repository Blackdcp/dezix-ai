"use client";

import { useState, Suspense } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

function RegisterForm() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        referralCode: refCode || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || t("registerError"));
      setLoading(false);
      return;
    }

    router.push("/login?registered=true");
  }

  const inputClass = "flex h-11 w-full rounded-xl border border-[#e4e4e7] bg-white px-3 py-2 text-sm text-[#1a1a2e] placeholder:text-[#a1a1aa] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 focus:border-[#7C5CFC]/50";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4">
      <div className="pointer-events-none fixed inset-0 dot-grid opacity-40" />
      <motion.div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#e4e4e7] bg-white p-10 shadow-xl shadow-black/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="absolute inset-x-0 top-0 h-1 gradient-brand" />
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="font-heading text-xl font-bold text-gradient-brand">Dezix AI</span>
          </Link>
          <h1 className="font-heading mt-6 text-2xl font-bold text-[#1a1a2e]">{t("registerTitle")}</h1>
          <p className="mt-1.5 text-sm text-[#71717a]">{t("registerSubtitle")}</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {refCode && (
            <div className="rounded-xl border border-[#7C5CFC]/20 bg-[#f0ecff] p-3 text-sm text-[#7C5CFC]">
              {t("referralNotice", { code: refCode })}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-[#1a1a2e]">
              {t("username")}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder={t("namePlaceholder")}
              required
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-[#1a1a2e]">
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
            <label htmlFor="password" className="text-sm font-medium text-[#1a1a2e]">
              {t("password")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder={t("passwordPlaceholder")}
              minLength={8}
              required
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            className="btn-primary flex h-11 w-full items-center justify-center text-sm font-medium disabled:opacity-50"
            disabled={loading}
          >
            {loading ? t("registering") : t("registerButton")}
          </button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e4e4e7]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-[#a1a1aa]">{t("orRegisterWith")}</span>
          </div>
        </div>
        <OAuthButtons mode="register" referralCode={refCode || undefined} />
        <div className="mt-6 text-center text-sm text-[#71717a]">
          {t("hasAccount")}{" "}
          <Link href="/login" className="font-medium text-[#7C5CFC] hover:text-[#6A4CE0]">
            {t("loginButton")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
