"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.status === 429) {
        setError("RATE_LIMITED");
        setLoading(false);
        return;
      }

      // Always show success (prevent email enumeration)
      setSent(true);
    } catch {
      setError("SERVER_ERROR");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "flex h-11 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F8F6] px-4">
      <div className="pointer-events-none fixed inset-0 dot-grid opacity-40" />
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
            {t("forgotPasswordTitle")}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t("forgotPasswordSubtitle")}
          </p>
        </div>

        {sent ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {t("resetEmailSent")}
            </div>
            <Link
              href="/login"
              className="btn-primary flex h-11 w-full items-center justify-center text-sm font-medium"
            >
              {t("backToLogin")}
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error === "RATE_LIMITED"
                  ? t("sending") + " — " + t("backToLogin")
                  : error}
              </div>
            )}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
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
            <button
              type="submit"
              className="btn-primary flex h-11 w-full items-center justify-center text-sm font-medium disabled:opacity-50"
              disabled={loading}
            >
              {loading ? t("sending") : t("sendResetLink")}
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
    </div>
  );
}
