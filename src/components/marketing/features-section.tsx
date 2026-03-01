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
  { icon: Globe, titleKey: "unifiedApi", descKey: "unifiedApiDesc", color: "#F26522", bg: "#FFF4ED", cardBg: "#FFFCF9" },
  { icon: Layers, titleKey: "multiModel", descKey: "multiModelDesc", color: "#0D9488", bg: "#CCFBF1", cardBg: "#F5FDFB" },
  { icon: Zap, titleKey: "streaming", descKey: "streamingDesc", color: "#16A34A", bg: "#D1FAE5", cardBg: "#F8FDF9" },
  { icon: Route, titleKey: "smartRouting", descKey: "smartRoutingDesc", color: "#F26522", bg: "#FFF4ED", cardBg: "#FFFCF9" },
  { icon: Receipt, titleKey: "transparentBilling", descKey: "transparentBillingDesc", color: "#F59E0B", bg: "#FEF3C7", cardBg: "#FFFDF7" },
  { icon: ShieldCheck, titleKey: "secure", descKey: "secureDesc", color: "#FF8C42", bg: "#FFF8F0", cardBg: "#FFFDF9" },
] as const;

export function FeaturesSection() {
  const t = useTranslations("Features");

  return (
    <section className="py-20 md:py-28">
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
        <AnimatedSection className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map((f) => (
            <AnimatedItem key={f.titleKey}>
              <div className="card-premium p-7" style={{ backgroundColor: f.cardBg }}>
                <div
                  className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ backgroundColor: f.bg }}
                >
                  <f.icon className="h-7 w-7" style={{ color: f.color }} />
                </div>
                <h3 className="font-heading mb-2 text-base font-semibold text-foreground">{t(f.titleKey)}</h3>
                <p className="text-sm leading-relaxed text-[#44403C]">{t(f.descKey)}</p>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}
