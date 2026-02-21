"use client";

import Link from "next/link";
import { GridBackground } from "@/components/marketing/grid-background";
import {
  AnimatedSection,
  AnimatedItem,
} from "@/components/ui/animated-section";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 md:py-36">
      <GridBackground />
      <div className="relative mx-auto max-w-6xl px-4 text-center">
        <AnimatedSection>
          <AnimatedItem>
            <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-[1.05] tracking-[-0.015em] text-[#1d1d1f] md:text-[56px]">
              一个 API Key
              <br />
              <span className="text-[#007AFF]">访问所有主流 AI 模型</span>
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-[#424245]">
              Dezix AI 统一网关让您通过 OpenAI 兼容接口，轻松调用 OpenAI、Anthropic、Google、DeepSeek 等多家模型，按量付费，透明计费。
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="btn-primary inline-flex h-12 items-center justify-center rounded-full px-8 text-base font-medium"
              >
                免费开始
              </Link>
              <Link
                href="/docs/quick-start"
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 px-8 text-base font-medium text-[#1d1d1f] transition-colors hover:bg-black/[0.03]"
              >
                查看文档
              </Link>
            </div>
          </AnimatedItem>
        </AnimatedSection>
      </div>
    </section>
  );
}
