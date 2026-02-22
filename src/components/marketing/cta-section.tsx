"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GridBackground } from "@/components/marketing/grid-background";
import {
  AnimatedSection,
  AnimatedItem,
} from "@/components/ui/animated-section";

export function CtaSection() {
  const t = useTranslations("Cta");

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <GridBackground />
      <div className="relative mx-auto max-w-6xl px-4 text-center">
        <AnimatedSection>
          <AnimatedItem>
            <h2 className="text-3xl font-semibold tracking-[-0.01em] text-[#1d1d1f] md:text-[40px]">
              {t("title")}{" "}
              <span className="text-[#007AFF]">Dezix AI</span>
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[#424245]">
              {t("description")}
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="btn-primary inline-flex h-12 items-center justify-center rounded-full px-8 text-base font-medium"
              >
                {t("freeRegister")}
              </Link>
              <Link
                href="/docs/quick-start"
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 px-8 text-base font-medium text-[#1d1d1f] transition-colors hover:bg-black/[0.03]"
              >
                {t("readDocs")}
              </Link>
            </div>
          </AnimatedItem>
        </AnimatedSection>
      </div>
    </section>
  );
}
