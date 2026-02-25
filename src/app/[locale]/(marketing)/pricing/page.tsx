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
          <h1 className="font-heading mb-3 text-center text-4xl font-bold tracking-tight text-[#1a1a2e] md:text-5xl">{t("title")}</h1>
        </AnimatedItem>
        <AnimatedItem>
          <p className="mx-auto mb-14 max-w-2xl text-center text-lg text-[#71717a]">
            {t("subtitle")}
          </p>
        </AnimatedItem>
      </AnimatedSection>

      {/* Plans */}
      <AnimatedSection className="mb-20 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <AnimatedItem key={plan.name}>
            <div
              className={`relative rounded-2xl border p-8 ${
                plan.highlight
                  ? "border-[#7C5CFC] bg-white shadow-lg shadow-[#7C5CFC]/10"
                  : "border-[#e4e4e7] bg-white"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-px left-0 right-0 h-[3px] rounded-t-2xl bg-[#7C5CFC]" />
              )}
              <h3 className="font-heading text-lg font-semibold text-[#1a1a2e]">{plan.name}</h3>
              <div className="mt-3 font-heading text-3xl font-bold text-[#1a1a2e]">{plan.price}</div>
              <p className="mt-2 text-sm text-[#a1a1aa]">{plan.desc}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#52525b]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2DB574]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-8 flex h-11 w-full items-center justify-center rounded-full text-sm font-medium transition-all ${
                  plan.highlight
                    ? "btn-primary"
                    : "border border-[#e4e4e7] bg-white text-[#1a1a2e] hover:bg-[#fafafa]"
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
          <h2 className="font-heading mb-3 text-2xl font-bold tracking-tight text-[#1a1a2e]">{tp("modelPricingTitle")}</h2>
        </AnimatedItem>
        <AnimatedItem>
          <p className="mb-8 text-lg text-[#71717a]">
            {tp("modelPricingDesc")}
          </p>
        </AnimatedItem>
      </AnimatedSection>

      {models.length > 0 && (
        <AnimatedSection>
          <AnimatedItem>
            <div className="overflow-hidden rounded-2xl border border-[#e4e4e7] bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#e4e4e7] bg-[#fafafa]">
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#a1a1aa]">{tp("modelName")}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#a1a1aa]">{tp("provider")}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#a1a1aa]">{tp("category")}</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#a1a1aa]">{tp("inputPrice")}</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#a1a1aa]">{tp("outputPrice")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.map((m) => (
                    <TableRow key={m.id} className="border-b border-[#e4e4e7] hover:bg-[#fafafa]/50">
                      <TableCell className="font-medium text-[#1a1a2e]">
                        {m.displayName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{m.providerName}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{m.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-[#52525b]">
                        ¥{m.sellPrice}/M
                      </TableCell>
                      <TableCell className="text-right text-[#52525b]">
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
            <p className="mb-5 text-lg text-[#71717a]">
              {tp("readyToStart")}
            </p>
            <Link
              href="/register"
              className="btn-primary inline-flex h-12 items-center justify-center gap-2 rounded-full px-8 text-base font-medium"
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
