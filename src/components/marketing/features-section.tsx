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
  { icon: Globe, titleKey: "unifiedApi", descKey: "unifiedApiDesc", color: "#0070F3", bg: "#EBF5FF", cardBg: "#FAFCFF" },
  { icon: Layers, titleKey: "multiModel", descKey: "multiModelDesc", color: "#D97706", bg: "#FEF3C7", cardBg: "#FFFCF5" },
  { icon: Zap, titleKey: "streaming", descKey: "streamingDesc", color: "#16A34A", bg: "#D1FAE5", cardBg: "#F8FDF9" },
  { icon: Route, titleKey: "smartRouting", descKey: "smartRoutingDesc", color: "#0070F3", bg: "#DBEAFE", cardBg: "#F8FBFF" },
  { icon: Receipt, titleKey: "transparentBilling", descKey: "transparentBillingDesc", color: "#F59E0B", bg: "#FEF3C7", cardBg: "#FFFDF7" },
  { icon: ShieldCheck, titleKey: "secure", descKey: "secureDesc", color: "#00B4D8", bg: "#CFFAFE", cardBg: "#F5FDFE" },
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
              <div className="card-gradient-line p-7" style={{ backgroundColor: f.cardBg }}>
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
