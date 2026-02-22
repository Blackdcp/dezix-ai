"use client";

import { useTranslations } from "next-intl";
import {
  Globe,
  Layers,
  Zap,
  Route,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import {
  AnimatedSection,
  AnimatedItem,
} from "@/components/ui/animated-section";

const featureKeys = [
  { icon: Globe, titleKey: "unifiedApi", descKey: "unifiedApiDesc" },
  { icon: Layers, titleKey: "multiModel", descKey: "multiModelDesc" },
  { icon: Zap, titleKey: "streaming", descKey: "streamingDesc" },
  { icon: Route, titleKey: "smartRouting", descKey: "smartRoutingDesc" },
  { icon: Receipt, titleKey: "transparentBilling", descKey: "transparentBillingDesc" },
  { icon: ShieldCheck, titleKey: "secure", descKey: "secureDesc" },
] as const;

export function FeaturesSection() {
  const t = useTranslations("Features");

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
        <AnimatedSection className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map((f) => (
            <AnimatedItem key={f.titleKey}>
              <div className="card-hover rounded-2xl bg-white p-8 shadow-sm">
                <f.icon className="mb-3 h-8 w-8 text-[#007AFF]" />
                <h3 className="mb-2 text-lg font-semibold text-[#1d1d1f]">{t(f.titleKey)}</h3>
                <p className="text-[15px] text-[#424245]">{t(f.descKey)}</p>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}
