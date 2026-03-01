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
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <AnimatedSection>
          <AnimatedItem>
            <h2 className="font-heading mb-4 text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {t("title")}
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="mx-auto mb-14 max-w-2xl text-center text-lg text-[#57534E]">
              {t("subtitle")}
            </p>
          </AnimatedItem>
        </AnimatedSection>
        <AnimatedSection className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <AnimatedItem key={plan.name}>
              <div
                className={`relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white p-8 ${
                  plan.highlight
                    ? "border-primary shadow-lg shadow-primary/10"
                    : "border-border"
                }`}
              >
                {plan.highlight && (
                  <>
                    <div className="absolute inset-x-0 top-0 h-[3px] gradient-brand" />
                    <div className="absolute -right-px -top-px rounded-bl-xl rounded-tr-2xl bg-primary px-3 py-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-white">{t("mostPopular")}</span>
                    </div>
                  </>
                )}
                <h3 className="font-heading text-lg font-semibold text-foreground">{plan.name}</h3>
                <div className="mt-3 font-heading text-3xl font-bold text-foreground">{plan.price}</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.desc}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[#57534E]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`mt-8 flex h-11 w-full items-center justify-center text-sm font-medium transition-all ${
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
