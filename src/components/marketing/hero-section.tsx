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
    <div className="card-elevated mx-auto mt-12 max-w-2xl overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-[#e4e4e7] bg-[#fafafa] px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#E8706A]" />
          <div className="h-3 w-3 rounded-full bg-[#f59e0b]" />
          <div className="h-3 w-3 rounded-full bg-[#2DB574]" />
        </div>
        <span className="ml-2 font-mono text-xs text-[#a1a1aa]">request.py</span>
      </div>
      {/* Code */}
      <pre className="overflow-x-auto bg-white p-5 text-sm leading-relaxed">
        <code>
          <span className="text-[#7C5CFC]">import</span>{" "}
          <span className="text-[#1a1a2e]">openai</span>{"\n\n"}
          <span className="text-[#1a1a2e]">client</span>{" "}
          <span className="text-[#a1a1aa]">=</span>{" "}
          <span className="text-[#1a1a2e]">openai</span>
          <span className="text-[#a1a1aa]">.</span>
          <span className="text-[#7C5CFC]">OpenAI</span>
          <span className="text-[#a1a1aa]">(</span>{"\n"}
          {"    "}
          <span className="text-[#1a1a2e]">base_url</span>
          <span className="text-[#a1a1aa]">=</span>
          <span className="text-[#2DB574]">&quot;https://api.dezix.ai/v1&quot;</span>
          <span className="text-[#a1a1aa]">,</span>{"\n"}
          {"    "}
          <span className="text-[#1a1a2e]">api_key</span>
          <span className="text-[#a1a1aa]">=</span>
          <span className="text-[#2DB574]">&quot;sk-dezix-...&quot;</span>{"\n"}
          <span className="text-[#a1a1aa]">)</span>{"\n\n"}
          <span className="text-[#1a1a2e]">response</span>{" "}
          <span className="text-[#a1a1aa]">=</span>{" "}
          <span className="text-[#1a1a2e]">client</span>
          <span className="text-[#a1a1aa]">.</span>
          <span className="text-[#1a1a2e]">chat</span>
          <span className="text-[#a1a1aa]">.</span>
          <span className="text-[#1a1a2e]">completions</span>
          <span className="text-[#a1a1aa]">.</span>
          <span className="text-[#7C5CFC]">create</span>
          <span className="text-[#a1a1aa]">(</span>{"\n"}
          {"    "}
          <span className="text-[#1a1a2e]">model</span>
          <span className="text-[#a1a1aa]">=</span>
          <span className="text-[#2DB574]">&quot;gpt-4o&quot;</span>
          <span className="text-[#a1a1aa]">,</span>{"\n"}
          {"    "}
          <span className="text-[#1a1a2e]">messages</span>
          <span className="text-[#a1a1aa]">=[&#123;</span>
          <span className="text-[#2DB574]">&quot;role&quot;</span>
          <span className="text-[#a1a1aa]">:</span>{" "}
          <span className="text-[#2DB574]">&quot;user&quot;</span>
          <span className="text-[#a1a1aa]">,</span>{" "}
          <span className="text-[#2DB574]">&quot;content&quot;</span>
          <span className="text-[#a1a1aa]">:</span>{" "}
          <span className="text-[#2DB574]">&quot;Hello!&quot;</span>
          <span className="text-[#a1a1aa]">&#125;]</span>{"\n"}
          <span className="text-[#a1a1aa]">)</span>
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
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#7C5CFC]/20 bg-[#f0ecff] px-4 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#7C5CFC] animate-pulse" />
              <span className="text-xs font-medium text-[#7C5CFC]">
                {t("titleLine1")}
              </span>
            </div>
          </AnimatedItem>

          {/* Heading */}
          <AnimatedItem>
            <h1 className="font-heading mx-auto max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-[#1a1a2e] sm:text-5xl md:text-6xl">
              {t("titleLine1")}
              <br />
              <span className="text-gradient-brand">{t("titleLine2")}</span>
            </h1>
          </AnimatedItem>

          {/* Subtitle */}
          <AnimatedItem>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#52525b]">
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
