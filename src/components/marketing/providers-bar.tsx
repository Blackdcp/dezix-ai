"use client";

import { motion } from "framer-motion";

const providers = [
  { name: "OpenAI" },
  { name: "Anthropic" },
  { name: "Google" },
  { name: "DeepSeek" },
  { name: "xAI" },
  { name: "字节跳动" },
  { name: "阿里云" },
  { name: "智谱 AI" },
  { name: "月之暗面" },
  { name: "MiniMax" },
  { name: "小米" },
  { name: "美团" },
  { name: "阶跃星辰" },
];

export function ProvidersBar() {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-6xl px-4">
        <p className="mb-4 text-center text-sm text-[#86868b]">
          支持的模型供应商
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {providers.map((p, i) => (
            <motion.span
              key={p.name}
              className="text-lg font-semibold text-[#1d1d1f]"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {p.name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
