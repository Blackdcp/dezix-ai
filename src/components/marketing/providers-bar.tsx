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
    <section className="py-10">
      <div className="mx-auto max-w-6xl px-4">
        <p className="mb-4 text-center text-sm text-[#86868b]">
          {t("title")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {providers.map((p, i) => (
            <motion.span
              key={p.name || p.nameKey}
              className="text-lg font-semibold text-[#1d1d1f]"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {p.name || t(p.nameKey!)}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
