"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { getProviderLogo } from "@/components/icons/provider-logos";

const providerKeys = [
  "OpenAI", "Anthropic", "Google", "DeepSeek", "xAI",
  "ByteDance", "Alibaba", "Zhipu", "Moonshot", "MiniMax",
  "Xiaomi", "Meituan", "StepFun",
];

export function ProvidersBar() {
  const t = useTranslations("Providers");

  return (
    <section className="border-y border-border bg-background py-12">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-[#A8A29E]">
          {t("title")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 md:gap-x-12">
          {providerKeys.map((key, i) => {
            const label = t(key);
            const { Logo, color } = getProviderLogo(key);
            return (
              <motion.div
                key={key}
                className="group flex items-center gap-2 grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100"
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 0.6, y: 0 }}
                whileHover={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Logo className="h-5 w-5" style={{ color }} />
                <span className="font-heading text-sm font-semibold text-[#57534E] transition-colors duration-300 group-hover:text-foreground">
                  {label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
