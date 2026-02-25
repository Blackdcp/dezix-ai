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
    <section className="bg-[#f8f9fb] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <AnimatedSection>
          <AnimatedItem>
            <h2 className="font-heading mb-4 text-center text-3xl font-bold tracking-tight text-[#0f1729] md:text-4xl">
              {t("title")}
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="mx-auto mb-14 max-w-2xl text-center text-lg text-[#3d4663]">
              {t("subtitle")}
            </p>
          </AnimatedItem>
        </AnimatedSection>
        <AnimatedSection className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <AnimatedItem key={plan.name}>
              <div
                className={`relative rounded-[14px] border bg-white p-8 ${
                  plan.highlight
                    ? "border-[#2563eb] shadow-lg shadow-[#2563eb]/10"
                    : "border-[var(--border)] card-elevated"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-px left-0 right-0 h-[3px] rounded-t-[14px] gradient-brand" />
                )}
                <h3 className="font-heading text-lg font-semibold text-[#0f1729]">{plan.name}</h3>
                <div className="mt-3 font-heading text-3xl font-bold text-[#0f1729]">{plan.price}</div>
                <p className="mt-2 text-sm text-[#7c8299]">
                  {plan.desc}
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[#3d4663]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2563eb]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`mt-8 flex h-11 w-full items-center justify-center rounded-[10px] text-sm font-medium transition-all ${
                    plan.highlight
                      ? "btn-primary"
                      : "btn-secondary"
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
