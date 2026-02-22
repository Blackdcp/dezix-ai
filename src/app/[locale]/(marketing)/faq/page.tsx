"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  AnimatedSection,
  AnimatedItem,
} from "@/components/ui/animated-section";
import { useTranslations } from "next-intl";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-black/[0.04]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-[15px] font-medium text-[#1d1d1f]">{q}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#86868b] transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-[15px] text-[#424245]">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  const t = useTranslations("Faq");

  const faqs = Array.from({ length: 8 }, (_, i) => ({
    q: t(`q${i + 1}`),
    a: t(`a${i + 1}`),
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <AnimatedSection>
        <AnimatedItem>
          <h1 className="mb-2 text-5xl font-bold leading-[1.05] tracking-[-0.015em] text-[#1d1d1f] md:text-[56px]">{t("title")}</h1>
        </AnimatedItem>
        <AnimatedItem>
          <p className="mb-8 text-lg text-[#424245]">
            {t("subtitle")}
          </p>
        </AnimatedItem>
      </AnimatedSection>
      <AnimatedSection>
        <AnimatedItem>
          <div className="rounded-2xl bg-white shadow-sm">
            <div className="px-6">
              {faqs.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </AnimatedItem>
      </AnimatedSection>
    </div>
  );
}
