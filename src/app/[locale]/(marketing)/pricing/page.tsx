"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Check } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AnimatedSection,
  AnimatedItem,
} from "@/components/ui/animated-section";
import { useTranslations } from "next-intl";

interface Model {
  id: string;
  modelId: string;
  displayName: string;
  providerName: string;
  category: string;
  sellPrice: number;
  sellOutPrice: number;
}

export default function PricingPage() {
  const t = useTranslations("PricingPage");
  const tp = useTranslations("Pricing");
  const [models, setModels] = useState<Model[]>([]);

  const freeFeatures = t.raw("freeFeatures") as string[];
  const payFeatures = t.raw("payFeatures") as string[];
  const entFeatures = t.raw("entFeatures") as string[];

  const plans = [
    {
      name: tp("freePlan"),
      price: tp("freePrice"),
      desc: t("freeDesc"),
      features: freeFeatures,
      cta: tp("freeRegister"),
      href: "/register",
      highlight: false,
    },
    {
      name: tp("payAsYouGo"),
      price: tp("payAsYouGoPrice"),
      desc: t("payDesc"),
      features: payFeatures,
      cta: tp("topUpNow"),
      href: "/register",
      highlight: true,
    },
    {
      name: tp("enterprise"),
      price: tp("enterprisePrice"),
      desc: t("entDesc"),
      features: entFeatures,
      cta: tp("contactSales"),
      href: "/faq",
      highlight: false,
    },
  ];

  useEffect(() => {
    fetch("/api/public/models")
      .then((r) => r.json())
      .then((data) => setModels(data.models || []))
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <AnimatedSection>
        <AnimatedItem>
          <h1 className="mb-2 text-center text-5xl font-bold leading-[1.05] tracking-[-0.015em] text-[#1d1d1f] md:text-[56px]">{t("title")}</h1>
        </AnimatedItem>
        <AnimatedItem>
          <p className="mb-12 text-center text-lg text-[#424245]">
            {t("subtitle")}
          </p>
        </AnimatedItem>
      </AnimatedSection>

      {/* Plans */}
      <AnimatedSection className="mb-16 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <AnimatedItem key={plan.name}>
            <div
              className={`rounded-2xl p-8 ${
                plan.highlight
                  ? "bg-white shadow-md ring-2 ring-[#007AFF]"
                  : "card-hover bg-white shadow-sm"
              }`}
            >
              <h3 className="text-lg font-semibold text-[#1d1d1f]">{plan.name}</h3>
              <div className="mt-2 text-2xl font-bold text-[#1d1d1f]">{plan.price}</div>
              <p className="mt-1 text-[15px] text-[#86868b]">{plan.desc}</p>
              <ul className="mt-6 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[15px] text-[#424245]">
                    <Check className="h-4 w-4 shrink-0 text-[#007AFF]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-6 flex h-12 w-full items-center justify-center rounded-full text-[15px] font-medium transition-colors ${
                  plan.highlight
                    ? "btn-primary"
                    : "border border-black/10 text-[#1d1d1f] hover:bg-black/[0.03]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          </AnimatedItem>
        ))}
      </AnimatedSection>

      {/* Model pricing table */}
      <AnimatedSection>
        <AnimatedItem>
          <h2 className="mb-2 text-3xl font-semibold tracking-[-0.01em] text-[#1d1d1f]">{tp("modelPricingTitle")}</h2>
        </AnimatedItem>
        <AnimatedItem>
          <p className="mb-6 text-lg text-[#424245]">
            {tp("modelPricingDesc")}
          </p>
        </AnimatedItem>
      </AnimatedSection>

      {models.length > 0 && (
        <AnimatedSection>
          <AnimatedItem>
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-black/[0.06] bg-[#f5f5f7]">
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#86868b]">{tp("modelName")}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#86868b]">{tp("provider")}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#86868b]">{tp("category")}</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#86868b]">{tp("inputPrice")}</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#86868b]">{tp("outputPrice")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.map((m) => (
                    <TableRow key={m.id} className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
                      <TableCell className="font-medium text-[#1d1d1f]">
                        {m.displayName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{m.providerName}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{m.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-[#424245]">
                        ¥{m.sellPrice}/M
                      </TableCell>
                      <TableCell className="text-right text-[#424245]">
                        ¥{m.sellOutPrice}/M
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </AnimatedItem>
        </AnimatedSection>
      )}

      {/* Bottom CTA */}
      <AnimatedSection>
        <AnimatedItem>
          <div className="mt-12 text-center">
            <p className="mb-4 text-lg text-[#424245]">
              {tp("readyToStart")}
            </p>
            <Link
              href="/register"
              className="btn-primary inline-flex h-12 items-center justify-center rounded-full px-8 text-base font-medium"
            >
              {tp("freeRegisterNow")}
            </Link>
          </div>
        </AnimatedItem>
      </AnimatedSection>
    </div>
  );
}
