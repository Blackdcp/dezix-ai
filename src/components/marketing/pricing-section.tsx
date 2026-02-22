"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Check } from "lucide-react";
import {
  AnimatedSection,
  AnimatedItem,
} from "@/components/ui/animated-section";

export function PricingSection() {
  const t = useTranslations("Pricing");

  const plans = [
    {
      name: t("freePlan"),
      price: t("freePrice"),
      desc: t("freeDesc"),
      features: [t("freeFeature1"), t("freeFeature2"), t("freeFeature3"), t("freeFeature4")],
      cta: t("freeRegister"),
      href: "/register" as const,
      highlight: false,
    },
    {
      name: t("payAsYouGo"),
      price: t("payAsYouGoPrice"),
      desc: t("payAsYouGoDesc"),
      features: [t("payFeature1"), t("payFeature2"), t("payFeature3"), t("payFeature4"), t("payFeature5")],
      cta: t("topUpNow"),
      href: "/register" as const,
      highlight: true,
    },
    {
      name: t("enterprise"),
      price: t("enterprisePrice"),
      desc: t("enterpriseDesc"),
      features: [t("entFeature1"), t("entFeature2"), t("entFeature3"), t("entFeature4"), t("entFeature5")],
      cta: t("contactSales"),
      href: "/faq" as const,
      highlight: false,
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <AnimatedSection>
          <AnimatedItem>
            <h2 className="mb-4 text-center text-3xl font-semibold tracking-[-0.01em] text-[#1d1d1f] md:text-[40px]">
              {t("title")}
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="mb-12 text-center text-lg text-[#424245]">
              {t("subtitle")}
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
