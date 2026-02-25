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
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[#f8f9fb] px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#e2e5eb]" />
          <div className="h-3 w-3 rounded-full bg-[#e2e5eb]" />
          <div className="h-3 w-3 rounded-full bg-[#e2e5eb]" />
        </div>
        <span className="ml-2 font-mono text-xs text-[#7c8299]">request.py</span>
      </div>
      {/* Code */}
      <pre className="overflow-x-auto p-5 text-sm leading-relaxed">
        <code>
          <span className="text-[#7c3aed]">import</span>{" "}
          <span className="text-[#0f1729]">openai</span>{"\n\n"}
          <span className="text-[#0f1729]">client</span>{" "}
          <span className="text-[#7c8299]">=</span>{" "}
          <span className="text-[#0f1729]">openai</span>
          <span className="text-[#7c8299]">.</span>
          <span className="text-[#2563eb]">OpenAI</span>
          <span className="text-[#7c8299]">(</span>{"\n"}
          {"    "}
          <span className="text-[#0f1729]">base_url</span>
          <span className="text-[#7c8299]">=</span>
          <span className="text-[#16a34a]">&quot;https://api.dezix.ai/v1&quot;</span>
          <span className="text-[#7c8299]">,</span>{"\n"}
          {"    "}
          <span className="text-[#0f1729]">api_key</span>
          <span className="text-[#7c8299]">=</span>
          <span className="text-[#16a34a]">&quot;sk-dezix-...&quot;</span>{"\n"}
          <span className="text-[#7c8299]">)</span>{"\n\n"}
          <span className="text-[#0f1729]">response</span>{" "}
          <span className="text-[#7c8299]">=</span>{" "}
          <span className="text-[#0f1729]">client</span>
          <span className="text-[#7c8299]">.</span>
          <span className="text-[#0f1729]">chat</span>
          <span className="text-[#7c8299]">.</span>
          <span className="text-[#0f1729]">completions</span>
          <span className="text-[#7c8299]">.</span>
          <span className="text-[#2563eb]">create</span>
          <span className="text-[#7c8299]">(</span>{"\n"}
          {"    "}
          <span className="text-[#0f1729]">model</span>
          <span className="text-[#7c8299]">=</span>
          <span className="text-[#16a34a]">&quot;gpt-4o&quot;</span>
          <span className="text-[#7c8299]">,</span>{"\n"}
          {"    "}
          <span className="text-[#0f1729]">messages</span>
          <span className="text-[#7c8299]">=[&#123;</span>
          <span className="text-[#16a34a]">&quot;role&quot;</span>
          <span className="text-[#7c8299]">:</span>{" "}
          <span className="text-[#16a34a]">&quot;user&quot;</span>
          <span className="text-[#7c8299]">,</span>{" "}
          <span className="text-[#16a34a]">&quot;content&quot;</span>
          <span className="text-[#7c8299]">:</span>{" "}
          <span className="text-[#16a34a]">&quot;Hello!&quot;</span>
          <span className="text-[#7c8299]">&#125;]</span>{"\n"}
          <span className="text-[#7c8299]">)</span>
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
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#2563eb]/20 bg-[#2563eb]/5 px-4 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#2563eb] animate-pulse" />
              <span className="text-xs font-medium text-[#2563eb]">
                {t("titleLine1")}
              </span>
            </div>
          </AnimatedItem>

          {/* Heading */}
          <AnimatedItem>
            <h1 className="font-heading mx-auto max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-[#0f1729] sm:text-5xl md:text-6xl">
              {t("titleLine1")}
              <br />
              <span className="text-gradient-brand">{t("titleLine2")}</span>
            </h1>
          </AnimatedItem>

          {/* Subtitle */}
          <AnimatedItem>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#3d4663]">
              {t("description")}
            </p>
          </AnimatedItem>

          {/* CTA buttons */}
          <AnimatedItem>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="btn-primary inline-flex h-12 items-center justify-center gap-2 px-8 text-base font-medium"
              >
                {t("getStarted")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs/quick-start"
                className="btn-secondary inline-flex h-12 items-center justify-center px-8 text-base font-medium"
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
