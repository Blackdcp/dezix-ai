"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Check, ArrowRight } from "lucide-react";
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
    <div className="mx-auto max-w-7xl px-6 py-16">
      <AnimatedSection>
        <AnimatedItem>
          <h1 className="font-heading mb-3 text-center text-4xl font-bold tracking-tight text-[#0f1729] md:text-5xl">{t("title")}</h1>
        </AnimatedItem>
        <AnimatedItem>
          <p className="mx-auto mb-14 max-w-2xl text-center text-lg text-[#3d4663]">
            {t("subtitle")}
          </p>
        </AnimatedItem>
      </AnimatedSection>

      {/* Plans */}
      <AnimatedSection className="mb-20 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <AnimatedItem key={plan.name}>
            <div
              className={`relative rounded-[14px] border bg-white p-8 ${
                plan.highlight
                  ? "border-[#2563eb] shadow-lg shadow-[#2563eb]/10"
                  : "border-[var(--border)] card-elevated"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-px left-0 right-0 h-[3px] rounded-t-[14px] gradient-brand" />
              )}
              <h3 className="font-heading text-lg font-semibold text-[#0f1729]">{plan.name}</h3>
              <div className="mt-3 font-heading text-3xl font-bold text-[#0f1729]">{plan.price}</div>
              <p className="mt-2 text-sm text-[#7c8299]">{plan.desc}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#3d4663]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2563eb]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-8 flex h-11 w-full items-center justify-center rounded-[10px] text-sm font-medium transition-all ${
                  plan.highlight
                    ? "btn-primary"
                    : "btn-secondary"
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
          <h2 className="font-heading mb-3 text-2xl font-bold tracking-tight text-[#0f1729]">{tp("modelPricingTitle")}</h2>
        </AnimatedItem>
        <AnimatedItem>
          <p className="mb-8 text-lg text-[#3d4663]">
            {tp("modelPricingDesc")}
          </p>
        </AnimatedItem>
      </AnimatedSection>

      {models.length > 0 && (
        <AnimatedSection>
          <AnimatedItem>
            <div className="overflow-hidden rounded-[14px] border border-[var(--border)] bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[var(--border)] bg-[#f8f9fb]">
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#7c8299]">{tp("modelName")}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#7c8299]">{tp("provider")}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#7c8299]">{tp("category")}</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#7c8299]">{tp("inputPrice")}</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#7c8299]">{tp("outputPrice")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.map((m) => (
                    <TableRow key={m.id} className="border-b border-[var(--border)] hover:bg-[#f8f9fb]/50">
                      <TableCell className="font-medium text-[#0f1729]">
                        {m.displayName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-md">{m.providerName}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-md">{m.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-[#3d4663]">
                        ¥{m.sellPrice}/M
                      </TableCell>
                      <TableCell className="text-right text-[#3d4663]">
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
          <div className="mt-16 text-center">
            <p className="mb-5 text-lg text-[#3d4663]">
              {tp("readyToStart")}
            </p>
            <Link
              href="/register"
              className="btn-primary inline-flex h-12 items-center justify-center gap-2 px-8 text-base font-medium"
            >
              {tp("freeRegisterNow")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </AnimatedItem>
      </AnimatedSection>
    </div>
  );
}
