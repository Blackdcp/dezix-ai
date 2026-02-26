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
  { icon: Globe, titleKey: "unifiedApi", descKey: "unifiedApiDesc", color: "#6366F1", bg: "#EEF2FF" },
  { icon: Layers, titleKey: "multiModel", descKey: "multiModelDesc", color: "#E87B6A", bg: "#fef0ef" },
  { icon: Zap, titleKey: "streaming", descKey: "streamingDesc", color: "#059669", bg: "#ecfdf3" },
  { icon: Route, titleKey: "smartRouting", descKey: "smartRoutingDesc", color: "#4D6BFE", bg: "#eef2ff" },
  { icon: Receipt, titleKey: "transparentBilling", descKey: "transparentBillingDesc", color: "#f59e0b", bg: "#fef9ec" },
  { icon: ShieldCheck, titleKey: "secure", descKey: "secureDesc", color: "#06b6d4", bg: "#ecfeff" },
] as const;

export function FeaturesSection() {
  const t = useTranslations("Features");

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <AnimatedSection>
          <AnimatedItem>
            <h2 className="font-heading mb-4 text-center text-3xl font-bold tracking-tight text-[#1C1917] md:text-4xl">
              {t("title")}
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="mx-auto mb-14 max-w-2xl text-center text-lg text-[#57534E]">
              {t("subtitle")}
            </p>
          </AnimatedItem>
        </AnimatedSection>
        <AnimatedSection className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map((f) => (
            <AnimatedItem key={f.titleKey}>
              <div className="card-gradient-line p-7">
                <div
                  className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: f.bg }}
                >
                  <f.icon className="h-6 w-6" style={{ color: f.color }} />
                </div>
                <h3 className="font-heading mb-2 text-base font-semibold text-[#1C1917]">{t(f.titleKey)}</h3>
                <p className="text-sm leading-relaxed text-[#57534E]">{t(f.descKey)}</p>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}
