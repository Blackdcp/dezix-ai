"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const providers = [
  { name: "OpenAI" },
  { name: "Anthropic" },
  { name: "Google" },
  { name: "DeepSeek" },
  { name: "xAI" },
  { nameKey: "bytedance" },
  { nameKey: "aliyun" },
  { nameKey: "zhipu" },
  { nameKey: "moonshot" },
  { name: "MiniMax" },
  { nameKey: "xiaomi" },
  { nameKey: "meituan" },
  { nameKey: "stepfun" },
];

export function ProvidersBar() {
  const t = useTranslations("Providers");

  return (
    <section className="border-y border-[#e4e4e7] bg-[#fafafa] py-10">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-6 text-center text-sm font-medium text-[#a1a1aa]">
          {t("title")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 md:gap-x-16">
          {providers.map((p, i) => (
            <motion.span
              key={p.name || p.nameKey}
              className="font-heading text-base font-semibold text-[#a1a1aa] transition-colors hover:text-[#1a1a2e]"
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {p.name || t(p.nameKey!)}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
