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
  const tProv = useTranslations("Providers");
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
          <h1 className="font-heading mb-3 text-center text-4xl font-bold tracking-tight text-foreground md:text-5xl">{t("title")}</h1>
        </AnimatedItem>
        <AnimatedItem>
          <p className="mx-auto mb-14 max-w-2xl text-center text-lg text-muted-foreground">
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
                  ? "border-border bg-white shadow-md shadow-black/[0.04] ring-1 ring-primary/15 pt-10"
                  : "border-border bg-white"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white">Most Popular</span>
                </div>
              )}
              <h3 className="font-heading text-lg font-semibold text-foreground">{plan.name}</h3>
              <div className="mt-3 font-heading text-3xl font-bold text-foreground">{plan.price}</div>
              <p className="mt-2 text-sm text-[#A8A29E]">{plan.desc}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#57534E]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-8 flex h-11 w-full items-center justify-center rounded-full text-sm font-medium transition-all ${
                  plan.highlight
                    ? "btn-primary"
                    : "border border-border bg-white text-foreground hover:bg-background"
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
          <h2 className="font-heading mb-3 text-2xl font-bold tracking-tight text-foreground">{tp("modelPricingTitle")}</h2>
        </AnimatedItem>
        <AnimatedItem>
          <p className="mb-8 text-lg text-muted-foreground">
            {tp("modelPricingDesc")}
          </p>
        </AnimatedItem>
      </AnimatedSection>

      {models.length > 0 && (
        <AnimatedSection>
          <AnimatedItem>
            <div className="overflow-hidden rounded-2xl border border-border bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-background">
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#A8A29E]">{tp("modelName")}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#A8A29E]">{tp("provider")}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#A8A29E]">{tp("category")}</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#A8A29E]">{tp("inputPrice")}</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#A8A29E]">{tp("outputPrice")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.map((m) => (
                    <TableRow key={m.id} className="border-b border-border hover:bg-background/50">
                      <TableCell className="font-medium text-foreground">
                        {m.displayName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{tProv(m.providerName)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{m.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-[#57534E]">
                        ¥{m.sellPrice}/M
                      </TableCell>
                      <TableCell className="text-right text-[#57534E]">
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
            <p className="mb-5 text-lg text-muted-foreground">
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
