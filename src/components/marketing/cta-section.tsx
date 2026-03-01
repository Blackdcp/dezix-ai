"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import {
  AnimatedSection,
  AnimatedItem,
} from "@/components/ui/animated-section";

export function CtaSection() {
  const t = useTranslations("Cta");

  return (
    <section className="relative overflow-hidden bg-[#1C1917] py-20 md:py-28">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(242,101,34,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,140,66,0.08),transparent_60%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <AnimatedSection>
          <AnimatedItem>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-white md:text-4xl">
              {t("title")}{" "}
              <span className="text-gradient-brand">Dezix AI</span>
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="mx-auto mt-5 max-w-xl text-lg text-[#A8A29E]">
              {t("description")}
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-medium text-foreground transition-all hover:bg-[#F5F3EF] hover:shadow-lg hover:shadow-white/10"
              >
                {t("freeRegister")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs/quick-start"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#44403C] px-8 text-base font-medium text-white transition-all hover:border-[#57534E] hover:bg-[#292524]"
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
