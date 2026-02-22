"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GridBackground } from "@/components/marketing/grid-background";
import {
  AnimatedSection,
  AnimatedItem,
} from "@/components/ui/animated-section";

export function HeroSection() {
  const t = useTranslations("Hero");

  return (
    <section className="relative overflow-hidden py-24 md:py-36">
      <GridBackground />
      <div className="relative mx-auto max-w-6xl px-4 text-center">
        <AnimatedSection>
          <AnimatedItem>
            <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-[1.05] tracking-[-0.015em] text-[#1d1d1f] md:text-[56px]">
              {t("titleLine1")}
              <br />
              <span className="text-[#007AFF]">{t("titleLine2")}</span>
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-[#424245]">
              {t("description")}
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="btn-primary inline-flex h-12 items-center justify-center rounded-full px-8 text-base font-medium"
              >
                {t("getStarted")}
              </Link>
              <Link
                href="/docs/quick-start"
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 px-8 text-base font-medium text-[#1d1d1f] transition-colors hover:bg-black/[0.03]"
              >
                {t("viewDocs")}
              </Link>
            </div>
          </AnimatedItem>
        </AnimatedSection>
      </div>
    </section>
  );
}
