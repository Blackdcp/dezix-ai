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
    <div className="border-b border-[#e4e4e7]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-sm font-medium text-[#1a1a2e]">{q}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#a1a1aa] transition-transform duration-200",
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
            <div className="pb-5 text-sm leading-relaxed text-[#52525b]">{a}</div>
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
    <div className="mx-auto max-w-3xl px-6 py-16">
      <AnimatedSection>
        <AnimatedItem>
          <h1 className="font-heading mb-3 text-4xl font-bold tracking-tight text-[#1a1a2e] md:text-5xl">{t("title")}</h1>
        </AnimatedItem>
        <AnimatedItem>
          <p className="mb-10 text-lg text-[#52525b]">
            {t("subtitle")}
          </p>
        </AnimatedItem>
      </AnimatedSection>
      <AnimatedSection>
        <AnimatedItem>
          <div className="rounded-2xl border border-[#e4e4e7] bg-white">
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
