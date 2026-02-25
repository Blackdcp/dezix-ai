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
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <AnimatedSection>
          <AnimatedItem>
            <h2 className="font-heading mb-4 text-center text-3xl font-bold tracking-tight text-[#1a1a2e] md:text-4xl">
              {t("title")}
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="mx-auto mb-14 max-w-2xl text-center text-lg text-[#52525b]">
              {t("subtitle")}
            </p>
          </AnimatedItem>
        </AnimatedSection>
        <AnimatedSection className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {models.map((m) => (
            <AnimatedItem key={m.id}>
              <div className="card-elevated p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-heading text-sm font-semibold text-[#1a1a2e]">{m.displayName}</span>
                  <Badge variant="secondary" className="rounded-full text-[10px] font-medium">
                    {m.providerName}
                  </Badge>
                </div>
                <p className="mb-3 font-mono text-xs text-[#a1a1aa]">
                  {m.modelId}
                </p>
                <div className="flex items-center justify-between text-xs text-[#71717a]">
                  <span>
                    ¥{m.sellPrice}/M {t("inputLabel")}
                  </span>
                  <span>{(m.maxContext / 1000).toFixed(0)}K {t("contextLabel")}</span>
                </div>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedSection>
        <div className="mt-10 text-center">
          <Link
            href="/model-list"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#7C5CFC] transition-colors hover:text-[#6A4CE0]"
          >
            {t("viewAll")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
