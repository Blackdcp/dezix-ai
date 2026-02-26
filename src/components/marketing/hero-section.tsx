"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GridBackground } from "@/components/marketing/grid-background";
import {
  AnimatedSection,
  AnimatedItem,
} from "@/components/ui/animated-section";
import { ArrowRight } from "lucide-react";

function CodePreview() {
  return (
    <div className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-2xl border border-[#292524] shadow-2xl shadow-black/20">
      {/* Title bar - dark */}
      <div className="flex items-center gap-2 border-b border-[#292524] bg-[#1C1917] px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#D97706]" />
          <div className="h-3 w-3 rounded-full bg-[#f59e0b]" />
          <div className="h-3 w-3 rounded-full bg-[#16A34A]" />
        </div>
        <span className="ml-2 font-mono text-xs text-[#78716C]">request.py</span>
      </div>
      {/* Code - dark */}
      <pre className="overflow-x-auto bg-[#0C0A09] p-5 text-sm leading-relaxed">
        <code>
          <span className="text-[#c084fc]">import</span>{" "}
          <span className="text-[#e2e8f0]">openai</span>{"\n\n"}
          <span className="text-[#e2e8f0]">client</span>{" "}
          <span className="text-[#78716C]">=</span>{" "}
          <span className="text-[#e2e8f0]">openai</span>
          <span className="text-[#78716C]">.</span>
          <span className="text-[#c084fc]">OpenAI</span>
          <span className="text-[#78716C]">(</span>{"\n"}
          {"    "}
          <span className="text-[#e2e8f0]">base_url</span>
          <span className="text-[#78716C]">=</span>
          <span className="text-[#4ade80]">&quot;https://api.dezix.ai/v1&quot;</span>
          <span className="text-[#78716C]">,</span>{"\n"}
          {"    "}
          <span className="text-[#e2e8f0]">api_key</span>
          <span className="text-[#78716C]">=</span>
          <span className="text-[#4ade80]">&quot;sk-dezix-...&quot;</span>{"\n"}
          <span className="text-[#78716C]">)</span>{"\n\n"}
          <span className="text-[#e2e8f0]">response</span>{" "}
          <span className="text-[#78716C]">=</span>{" "}
          <span className="text-[#e2e8f0]">client</span>
          <span className="text-[#78716C]">.</span>
          <span className="text-[#e2e8f0]">chat</span>
          <span className="text-[#78716C]">.</span>
          <span className="text-[#e2e8f0]">completions</span>
          <span className="text-[#78716C]">.</span>
          <span className="text-[#c084fc]">create</span>
          <span className="text-[#78716C]">(</span>{"\n"}
          {"    "}
          <span className="text-[#e2e8f0]">model</span>
          <span className="text-[#78716C]">=</span>
          <span className="text-[#4ade80]">&quot;gpt-4o&quot;</span>
          <span className="text-[#78716C]">,</span>{"\n"}
          {"    "}
          <span className="text-[#e2e8f0]">messages</span>
          <span className="text-[#78716C]">=[&#123;</span>
          <span className="text-[#4ade80]">&quot;role&quot;</span>
          <span className="text-[#78716C]">:</span>{" "}
          <span className="text-[#4ade80]">&quot;user&quot;</span>
          <span className="text-[#78716C]">,</span>{" "}
          <span className="text-[#4ade80]">&quot;content&quot;</span>
          <span className="text-[#78716C]">:</span>{" "}
          <span className="text-[#4ade80]">&quot;Hello!&quot;</span>
          <span className="text-[#78716C]">&#125;]</span>{"\n"}
          <span className="text-[#78716C]">)</span>
        </code>
      </pre>
    </div>
  );
}

export function HeroSection() {
  const t = useTranslations("Hero");

  return (
    <section className="relative overflow-hidden pb-16 pt-24 md:pb-24 md:pt-36">
      <GridBackground />
      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <AnimatedSection>
          {/* Badge */}
          <AnimatedItem>
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#0070F3]/20 bg-[#EBF5FF] px-4 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#0070F3] animate-pulse" />
              <span className="text-xs font-medium text-[#0070F3]">
                {t("badge")}
              </span>
            </div>
          </AnimatedItem>

          {/* Heading */}
          <AnimatedItem>
            <h1 className="font-heading mx-auto max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-[#1C1917] sm:text-5xl md:text-6xl">
              {t("titleLine1")}
              <br />
              <span className="text-gradient-brand">{t("titleLine2")}</span>
            </h1>
          </AnimatedItem>

          {/* Subtitle */}
          <AnimatedItem>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#57534E] md:text-lg">
              {t("description")}
            </p>
          </AnimatedItem>

          {/* CTA buttons */}
          <AnimatedItem>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="btn-primary inline-flex h-12 items-center justify-center gap-2 px-8 text-base"
              >
                {t("getStarted")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs/quick-start"
                className="btn-secondary inline-flex h-12 items-center justify-center px-8 text-base"
              >
                {t("viewDocs")}
              </Link>
            </div>
          </AnimatedItem>

          {/* Code preview */}
          <AnimatedItem>
            <CodePreview />
          </AnimatedItem>
        </AnimatedSection>
      </div>
    </section>
  );
}
