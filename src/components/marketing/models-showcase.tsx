"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import {
  AnimatedSection,
  AnimatedItem,
} from "@/components/ui/animated-section";

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

export function ModelsShowcase() {
  const t = useTranslations("ModelsShowcase");
  const [models, setModels] = useState<Model[]>([]);

  useEffect(() => {
    fetch("/api/public/models")
      .then((r) => r.json())
      .then((data) => {
        if (data.models) {
          setModels(data.models.slice(0, 8));
        }
      })
      .catch(() => {});
  }, []);

  if (models.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <AnimatedSection>
          <AnimatedItem>
            <h2 className="mb-4 text-center text-3xl font-semibold tracking-[-0.01em] text-[#1d1d1f] md:text-[40px]">{t("title")}</h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="mb-12 text-center text-lg text-[#424245]">
              {t("subtitle")}
            </p>
          </AnimatedItem>
        </AnimatedSection>
        <AnimatedSection className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {models.map((m) => (
            <AnimatedItem key={m.id}>
              <div className="card-hover rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-[#1d1d1f]">{m.displayName}</span>
                  <Badge variant="secondary" className="text-xs">
                    {m.providerName}
                  </Badge>
                </div>
                <p className="mb-3 font-mono text-xs text-[#86868b]">
                  {m.modelId}
                </p>
                <div className="flex items-center justify-between text-xs text-[#86868b]">
                  <span>
                    ¥{m.sellPrice}/M {t("inputLabel")}
                  </span>
                  <span>{(m.maxContext / 1000).toFixed(0)}K {t("contextLabel")}</span>
                </div>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedSection>
        <div className="mt-8 text-center">
          <Link
            href="/model-list"
            className="text-sm font-medium text-[#007AFF] hover:underline"
          >
            {t("viewAll")} &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
