"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import {
  AnimatedSection,
  AnimatedItem,
} from "@/components/ui/animated-section";

const plans = [
  {
    name: "免费体验",
    price: "¥0",
    desc: "注册即送体验额度",
    features: ["注册赠送余额", "全部模型可用", "API 访问", "社区支持"],
    cta: "免费注册",
    href: "/register",
    highlight: false,
  },
  {
    name: "按量付费",
    price: "按 Token 计费",
    desc: "用多少付多少",
    features: [
      "按实际用量计费",
      "全部模型可用",
      "流式响应支持",
      "完整用量统计",
      "优先技术支持",
    ],
    cta: "立即充值",
    href: "/register",
    highlight: true,
  },
  {
    name: "企业方案",
    price: "联系我们",
    desc: "大规模定制方案",
    features: [
      "专属定价",
      "私有化部署",
      "SLA 保障",
      "专属技术支持",
      "自定义模型接入",
    ],
    cta: "联系销售",
    href: "/faq",
    highlight: false,
  },
];

export function PricingSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <AnimatedSection>
          <AnimatedItem>
            <h2 className="mb-4 text-center text-3xl font-semibold tracking-[-0.01em] text-[#1d1d1f] md:text-[40px]">
              简单透明的定价
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="mb-12 text-center text-lg text-[#424245]">
              按量付费，无月费，无隐藏费用
            </p>
          </AnimatedItem>
        </AnimatedSection>
        <AnimatedSection className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <AnimatedItem key={plan.name}>
              <div
                className={`rounded-2xl p-8 ${
                  plan.highlight
                    ? "bg-white shadow-md ring-2 ring-[#007AFF]"
                    : "card-hover bg-white shadow-sm"
                }`}
              >
                <h3 className="text-lg font-semibold text-[#1d1d1f]">{plan.name}</h3>
                <div className="mt-2 text-2xl font-bold text-[#1d1d1f]">{plan.price}</div>
                <p className="mt-1 text-[15px] text-[#86868b]">
                  {plan.desc}
                </p>
                <ul className="mt-6 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[15px] text-[#424245]">
                      <Check className="h-4 w-4 text-[#007AFF]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`mt-6 flex h-12 w-full items-center justify-center rounded-full text-[15px] font-medium transition-colors ${
                    plan.highlight
                      ? "btn-primary"
                      : "border border-black/10 text-[#1d1d1f] hover:bg-black/[0.03]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}
