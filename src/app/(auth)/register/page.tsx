"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

function RegisterForm() {
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
      setError(data.error || "注册失败");
      setLoading(false);
      return;
    }

    router.push("/login?registered=true");
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
          <h1 className="mt-4 text-xl font-bold text-[#1d1d1f]">注册</h1>
          <p className="mt-1 text-[15px] text-[#86868b]">创建你的账号，开始使用 AI 模型</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {refCode && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-[#007AFF]">
              你通过推荐链接注册，邀请码：{refCode}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-[#1d1d1f]">
              用户名
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="你的名字"
              required
              className="flex h-12 w-full rounded-xl border-0 bg-[#f5f5f7] px-3 py-2 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-[#1d1d1f]">
              邮箱
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
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="至少 8 位"
              minLength={8}
              required
              className="flex h-12 w-full rounded-xl border-0 bg-[#f5f5f7] px-3 py-2 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
          <button
            type="submit"
            className="btn-primary flex h-12 w-full items-center justify-center rounded-full text-base font-medium disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "注册中..." : "注册"}
          </button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#d2d2d7]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-[#86868b]">或使用以下方式注册</span>
          </div>
        </div>
        <OAuthButtons mode="register" referralCode={refCode || undefined} />
        <div className="mt-4 text-center text-sm text-[#86868b]">
          已有账号？{" "}
          <Link href="/login" className="text-[#007AFF] hover:underline">
            登录
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
