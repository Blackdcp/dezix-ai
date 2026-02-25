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
    <section className="py-20 md:py-28">
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
        <AnimatedSection className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map((f) => (
            <AnimatedItem key={f.titleKey}>
              <div className="card-gradient-line p-7">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#2563eb]/10">
                  <f.icon className="h-5 w-5 text-[#2563eb]" />
                </div>
                <h3 className="font-heading mb-2 text-base font-semibold text-[#0f1729]">{t(f.titleKey)}</h3>
                <p className="text-sm leading-relaxed text-[#3d4663]">{t(f.descKey)}</p>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}
