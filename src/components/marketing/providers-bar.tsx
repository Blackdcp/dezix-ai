"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  OpenAILogo,
  AnthropicLogo,
  GoogleLogo,
  DeepSeekLogo,
  XAILogo,
  GenericProviderLogo,
} from "@/components/icons/provider-logos";
import { type SVGProps } from "react";

type LogoComp = (props: SVGProps<SVGSVGElement>) => React.ReactElement;

const providers: { name?: string; nameKey?: string; Logo: LogoComp; color: string }[] = [
  { name: "OpenAI", Logo: OpenAILogo, color: "#10a37f" },
  { name: "Anthropic", Logo: AnthropicLogo, color: "#d97757" },
  { name: "Google", Logo: GoogleLogo, color: "#4285F4" },
  { name: "DeepSeek", Logo: DeepSeekLogo, color: "#4D6BFE" },
  { name: "xAI", Logo: XAILogo, color: "#000000" },
  { nameKey: "bytedance", Logo: GenericProviderLogo, color: "#3C8CFF" },
  { nameKey: "aliyun", Logo: GenericProviderLogo, color: "#FF6A00" },
  { nameKey: "zhipu", Logo: GenericProviderLogo, color: "#4F46E5" },
  { nameKey: "moonshot", Logo: GenericProviderLogo, color: "#1C1917" },
  { name: "MiniMax", Logo: GenericProviderLogo, color: "#4F46E5" },
  { nameKey: "xiaomi", Logo: GenericProviderLogo, color: "#FF6900" },
  { nameKey: "meituan", Logo: GenericProviderLogo, color: "#FFD100" },
  { nameKey: "stepfun", Logo: GenericProviderLogo, color: "#6366F1" },
];

export function ProvidersBar() {
  const t = useTranslations("Providers");

  return (
    <section className="border-y border-[#E7E5E0] bg-[#F9F8F6] py-12">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-[#A8A29E]">
          {t("title")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 md:gap-x-12">
          {providers.map((p, i) => {
            const label = p.name || t(p.nameKey!);
            return (
              <motion.div
                key={label}
                className="group flex items-center gap-2 grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100"
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 0.6, y: 0 }}
                whileHover={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <p.Logo className="h-5 w-5 transition-colors duration-300" style={{ color: p.color }} />
                <span className="font-heading text-sm font-semibold text-[#57534E] transition-colors duration-300 group-hover:text-[#1C1917]">
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
