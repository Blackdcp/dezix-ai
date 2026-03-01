"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

function ResetPasswordForm() {
  const t = useTranslations("Auth");
  const tErr = useTranslations("Errors");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorKey = data.error as string;
        if (errorKey === "INVALID_TOKEN" || errorKey === "TOKEN_EXPIRED") {
          setError(t(errorKey === "TOKEN_EXPIRED" ? "tokenExpired" : "invalidToken"));
        } else {
          setError(tErr(errorKey) || tErr("SERVER_ERROR"));
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError(tErr("SERVER_ERROR"));
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "flex h-11 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50";

  // No token in URL
  if (!token) {
    return (
      <motion.div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-white p-10 shadow-xl shadow-black/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="font-heading text-xl font-bold text-gradient-brand">
              Dezix AI
            </span>
          </Link>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {t("invalidToken")}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/forgot-password"
            className="btn-primary inline-flex h-11 items-center justify-center px-6 text-sm font-medium"
          >
            {t("forgotPasswordTitle")}
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-white p-10 shadow-xl shadow-black/5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-1">
          <span className="font-heading text-xl font-bold text-gradient-brand">
            Dezix AI
          </span>
        </Link>
        <h1 className="font-heading mt-6 text-2xl font-bold text-foreground">
          {t("resetPasswordTitle")}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t("resetPasswordSubtitle")}
        </p>
      </div>

      {success ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {t("passwordResetSuccess")}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              {t("newPassword")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder={t("passwordPlaceholder")}
              required
              minLength={8}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-foreground"
            >
              {t("confirmPassword")}
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder={t("passwordPlaceholder")}
              required
              minLength={8}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            className="btn-primary flex h-11 w-full items-center justify-center text-sm font-medium disabled:opacity-50"
            disabled={loading}
          >
            {loading ? t("resetting") : t("resetPassword")}
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-primary hover:text-accent-brand-hover"
        >
          {t("backToLogin")}
        </Link>
      </div>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F8F6] px-4">
      <div className="pointer-events-none fixed inset-0 dot-grid opacity-40" />
      <Suspense
        fallback={
          <div className="w-full max-w-md animate-pulse rounded-2xl border border-border bg-white p-10 shadow-xl shadow-black/5">
            <div className="mx-auto mb-8 h-6 w-24 rounded bg-gray-200" />
            <div className="mb-4 h-8 w-48 rounded bg-gray-200" />
            <div className="space-y-4">
              <div className="h-11 rounded-xl bg-gray-100" />
              <div className="h-11 rounded-xl bg-gray-100" />
              <div className="h-11 rounded-xl bg-gray-200" />
            </div>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
