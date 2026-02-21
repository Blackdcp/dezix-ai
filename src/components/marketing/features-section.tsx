"use client";

import {
  Globe,
  Layers,
  Zap,
  Route,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import {
  AnimatedSection,
  AnimatedItem,
} from "@/components/ui/animated-section";

const features = [
  {
    icon: Globe,
    title: "统一接口",
    desc: "100% OpenAI 兼容 API，无需修改代码即可切换模型供应商。",
  },
  {
    icon: Layers,
    title: "多模型支持",
    desc: "一站式访问 GPT-4o、Claude、Gemini、DeepSeek 等主流模型。",
  },
  {
    icon: Zap,
    title: "流式响应",
    desc: "完整支持 SSE 流式输出，实时获取模型生成内容。",
  },
  {
    icon: Route,
    title: "智能路由",
    desc: "自动选择最优渠道，上游故障时无缝切换备用通道。",
  },
  {
    icon: Receipt,
    title: "透明计费",
    desc: "按 Token 用量付费，价格公开透明，实时查看消费记录。",
  },
  {
    icon: ShieldCheck,
    title: "安全可靠",
    desc: "API Key 哈希存储，请求日志完整记录，支持 IP 白名单。",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <AnimatedSection>
          <AnimatedItem>
            <h2 className="mb-4 text-center text-3xl font-semibold tracking-[-0.01em] text-[#1d1d1f] md:text-[40px]">
              为什么选择 Dezix AI
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="mb-12 text-center text-lg text-[#424245]">
              为开发者打造的统一 AI 模型网关
            </p>
          </AnimatedItem>
        </AnimatedSection>
        <AnimatedSection className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <AnimatedItem key={f.title}>
              <div className="card-hover rounded-2xl bg-white p-8 shadow-sm">
                <f.icon className="mb-3 h-8 w-8 text-[#007AFF]" />
                <h3 className="mb-2 text-lg font-semibold text-[#1d1d1f]">{f.title}</h3>
                <p className="text-[15px] text-[#424245]">{f.desc}</p>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}
