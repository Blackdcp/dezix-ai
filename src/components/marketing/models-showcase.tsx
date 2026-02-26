"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import {
  AnimatedSection,
  AnimatedItem,
} from "@/components/ui/animated-section";
import { getProviderLogo } from "@/components/icons/provider-logos";

interface Model {
  id: string;
  modelId: string;
  displayName: string;
  providerName: string;
  category: string;
  sellPrice: number;
  sellOutPrice: number;
  maxContext: number;
}

function ModelSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#E7E5E0] bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-4 w-28 rounded bg-[#F5F3EF]" />
        <div className="h-5 w-14 rounded-full bg-[#F5F3EF]" />
      </div>
      <div className="mb-4 h-3 w-40 rounded bg-[#F5F3EF]" />
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 rounded bg-[#F5F3EF]" />
        <div className="h-3 w-16 rounded bg-[#F5F3EF]" />
      </div>
    </div>
  );
}

function formatDisplayPrice(price: number): string {
  const perMillion = price * 1000;
  if (perMillion < 0.01) return "<0.01";
  return perMillion.toFixed(2);
}

export function ModelsShowcase() {
  const t = useTranslations("ModelsShowcase");
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/models")
      .then((r) => r.json())
      .then((data) => {
        if (data.models) {
          setModels(data.models.slice(0, 8));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <AnimatedSection>
          <AnimatedItem>
            <h2 className="font-heading mb-4 text-center text-3xl font-bold tracking-tight text-[#1C1917] md:text-4xl">
              {t("title")}
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="mx-auto mb-14 max-w-2xl text-center text-lg text-[#57534E]">
              {t("subtitle")}
            </p>
          </AnimatedItem>
        </AnimatedSection>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ModelSkeleton key={i} />
            ))}
          </div>
        ) : models.length === 0 ? null : (
          <AnimatedSection className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {models.map((m) => {
              const { Logo, color } = getProviderLogo(m.providerName);
              return (
                <AnimatedItem key={m.id}>
                  <Link href={`/model-list`}>
                    <div className="card-elevated cursor-pointer p-5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-heading text-sm font-semibold text-[#1C1917]">{m.displayName}</span>
                        <Badge variant="secondary" className="flex items-center gap-1 rounded-full text-[10px] font-medium">
                          <Logo className="h-3 w-3" style={{ color }} />
                          {m.providerName}
                        </Badge>
                      </div>
                      <p className="mb-3 font-mono text-xs text-[#A8A29E]">
                        {m.modelId}
                      </p>
                      <div className="flex items-center justify-between text-xs text-[#78716C]">
                        <span>
                          ¥{formatDisplayPrice(m.sellPrice)}/M {t("inputLabel")}
                        </span>
                        <span>{(m.maxContext / 1000).toFixed(0)}K {t("contextLabel")}</span>
                      </div>
                    </div>
                  </Link>
                </AnimatedItem>
              );
            })}
          </AnimatedSection>
        )}
        <div className="mt-10 text-center">
          <Link
            href="/model-list"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#0070F3] transition-colors hover:text-[#0060D0]"
          >
            {t("viewAll")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
