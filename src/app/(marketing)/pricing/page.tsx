"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
      <h1 className="mb-2 text-center text-3xl font-bold">定价方案</h1>
      <p className="mb-12 text-center text-muted-foreground">
        简单透明的按量计费，无月费，无隐藏费用
      </p>

      {/* Plans */}
      <div className="mb-16 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-lg border p-6 ${
              plan.highlight ? "border-primary shadow-lg" : "bg-card"
            }`}
          >
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <div className="mt-2 text-2xl font-bold">{plan.price}</div>
            <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
            <ul className="mt-6 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="mt-6 w-full"
              variant={plan.highlight ? "default" : "outline"}
              asChild
            >
              <Link href={plan.href}>{plan.cta}</Link>
            </Button>
          </div>
        ))}
      </div>

      {/* Model pricing table */}
      <h2 className="mb-2 text-2xl font-bold">模型定价明细</h2>
      <p className="mb-6 text-muted-foreground">
        价格单位为每百万 Token（¥/M tokens）
      </p>

      {models.length > 0 && (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>模型名称</TableHead>
                <TableHead>供应商</TableHead>
                <TableHead>分类</TableHead>
                <TableHead className="text-right">输入价格</TableHead>
                <TableHead className="text-right">输出价格</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    {m.displayName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{m.providerName}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{m.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ¥{m.sellPrice}/M
                  </TableCell>
                  <TableCell className="text-right">
                    ¥{m.sellOutPrice}/M
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-12 text-center">
        <p className="mb-4 text-muted-foreground">
          准备好开始使用了吗？
        </p>
        <Button size="lg" asChild>
          <Link href="/register">免费注册，立即体验</Link>
        </Button>
      </div>
    </div>
  );
}
