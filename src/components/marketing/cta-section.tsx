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
    <section className="relative overflow-hidden py-20 md:py-28">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="dot-grid absolute inset-0 opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8f9fb] via-transparent to-[#f8f9fb]" />
        <div className="glow-orb left-1/3 top-1/3 h-72 w-72 bg-[#2563eb]" />
        <div className="glow-orb right-1/3 bottom-1/3 h-64 w-64 bg-[#7c3aed]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <AnimatedSection>
          <AnimatedItem>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-[#0f1729] md:text-4xl">
              {t("title")}{" "}
              <span className="text-gradient-brand">Dezix AI</span>
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="mx-auto mt-5 max-w-xl text-lg text-[#3d4663]">
              {t("description")}
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="btn-primary inline-flex h-12 items-center justify-center gap-2 px-8 text-base font-medium"
              >
                {t("freeRegister")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs/quick-start"
                className="btn-secondary inline-flex h-12 items-center justify-center px-8 text-base font-medium"
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
