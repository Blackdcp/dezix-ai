import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "免费体验",
    price: "¥0",
    desc: "注册即送体验额度",
    features: ["注册赠送余额", "全部模型可用", "API 访问", "社区支持"],
    cta: "免费注册",
    href: "/register",
    highlight: false,
  },
  {
    name: "按量付费",
    price: "按 Token 计费",
    desc: "用多少付多少",
    features: [
      "按实际用量计费",
      "全部模型可用",
      "流式响应支持",
      "完整用量统计",
      "优先技术支持",
    ],
    cta: "立即充值",
    href: "/register",
    highlight: true,
  },
  {
    name: "企业方案",
    price: "联系我们",
    desc: "大规模定制方案",
    features: [
      "专属定价",
      "私有化部署",
      "SLA 保障",
      "专属技术支持",
      "自定义模型接入",
    ],
    cta: "联系销售",
    href: "/faq",
    highlight: false,
  },
];

export function PricingSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold">
          简单透明的定价
        </h2>
        <p className="mb-12 text-center text-muted-foreground">
          按量付费，无月费，无隐藏费用
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg border p-6 ${
                plan.highlight
                  ? "border-primary shadow-lg"
                  : "bg-card"
              }`}
            >
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-2 text-2xl font-bold">{plan.price}</div>
              <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
              <ul className="mt-6 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
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
      </div>
    </section>
  );
}
