"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

interface Model {
  id: string;
  modelId: string;
  displayName: string;
  providerName: string;
  category: string;
  sellPrice: number;
  sellOutPrice: number;
}

const plans = [
  {
    name: "免费体验",
    price: "¥0",
    desc: "注册即送体验额度，快速上手",
    features: [
      "注册赠送体验余额",
      "全部模型可用",
      "API 调用访问",
      "基础用量统计",
      "社区支持",
    ],
    cta: "免费注册",
    href: "/register",
    highlight: false,
  },
  {
    name: "按量付费",
    price: "按 Token 计费",
    desc: "用多少付多少，灵活便捷",
    features: [
      "按实际 Token 用量计费",
      "全部模型可用",
      "流式响应支持",
      "完整用量统计与分析",
      "多 API Key 管理",
      "优先技术支持",
    ],
    cta: "立即充值",
    href: "/register",
    highlight: true,
  },
  {
    name: "企业方案",
    price: "联系我们",
    desc: "大规模使用定制方案",
    features: [
      "专属优惠定价",
      "私有化部署选项",
      "99.9% SLA 保障",
      "专属客户经理",
      "自定义模型接入",
      "账单与合同支持",
    ],
    cta: "联系销售",
    href: "/faq",
    highlight: false,
  },
];

export default function PricingPage() {
  const [models, setModels] = useState<Model[]>([]);

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
          <h1 className="mb-2 text-center text-5xl font-bold leading-[1.05] tracking-[-0.015em] text-[#1d1d1f] md:text-[56px]">定价方案</h1>
        </AnimatedItem>
        <AnimatedItem>
          <p className="mb-12 text-center text-lg text-[#424245]">
            简单透明的按量计费，无月费，无隐藏费用
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
          <h2 className="mb-2 text-3xl font-semibold tracking-[-0.01em] text-[#1d1d1f]">模型定价明细</h2>
        </AnimatedItem>
        <AnimatedItem>
          <p className="mb-6 text-lg text-[#424245]">
            价格单位为每百万 Token（¥/M tokens）
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
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#86868b]">模型名称</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#86868b]">供应商</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#86868b]">分类</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#86868b]">输入价格</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#86868b]">输出价格</TableHead>
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
              准备好开始使用了吗？
            </p>
            <Link
              href="/register"
              className="btn-primary inline-flex h-12 items-center justify-center rounded-full px-8 text-base font-medium"
            >
              免费注册，立即体验
            </Link>
          </div>
        </AnimatedItem>
      </AnimatedSection>
    </div>
  );
}
