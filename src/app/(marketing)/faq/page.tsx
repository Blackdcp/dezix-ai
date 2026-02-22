"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  AnimatedSection,
  AnimatedItem,
} from "@/components/ui/animated-section";

const faqs = [
  {
    q: "Dezix AI 是什么？",
    a: "Dezix AI 是一个统一的 AI 模型 API 网关平台。通过一个 API Key，您可以访问 OpenAI、Anthropic、Google、DeepSeek、xAI、字节跳动、阿里云、智谱 AI、月之暗面、MiniMax、小米、美团、阶跃星辰等 13 家供应商的 90+ 款 AI 模型，无需分别注册和管理多个平台的账号和密钥。",
  },
  {
    q: "API 接口兼容 OpenAI 格式吗？",
    a: "是的，Dezix AI 100% 兼容 OpenAI API 格式。您只需将请求地址指向 Dezix AI 的 API 端点，使用 Dezix AI 的 API Key，即可无缝切换。支持 Chat Completions、Models 等端点，支持流式和非流式响应。",
  },
  {
    q: "如何获取 API Key？",
    a: "注册 Dezix AI 账号后，在控制台的「API 密钥」页面即可创建 API Key。每个 Key 以 sk-dezix- 为前缀，支持设置名称、速率限制和 IP 白名单。",
  },
  {
    q: "计费方式是怎样的？",
    a: "Dezix AI 采用按量付费模式，根据实际使用的 Token 数量计费。不同模型有不同的定价，价格公开透明。您可以在控制台实时查看用量和消费记录。注册即赠送免费体验额度。",
  },
  {
    q: "支持哪些模型？",
    a: "目前支持 OpenAI（GPT-5、GPT-5.2）、Anthropic（Claude 4.6 Opus、Claude 4.5 Sonnet）、Google（Gemini 3.1 Pro、Gemini 2.5 Flash）、DeepSeek（DeepSeek V3.2、DeepSeek R1）、xAI（Grok 4.1）、字节跳动（豆包 Seed 2.0）、阿里云（Qwen3 Max、Qwen3 Coder）、智谱 AI（GLM-5）、月之暗面（Kimi K2.5）、MiniMax（M2.5）等 90+ 款主流模型。我们会持续更新支持的模型列表。",
  },
  {
    q: "流式响应如何使用？",
    a: "在请求参数中设置 stream: true 即可开启流式响应。Dezix AI 完整支持 SSE（Server-Sent Events）协议，与 OpenAI 的流式格式完全一致。",
  },
  {
    q: "数据安全如何保障？",
    a: "Dezix AI 非常重视数据安全。API Key 以 SHA-256 哈希方式存储，请求日志完整记录但不存储实际对话内容。支持 IP 白名单限制访问来源。所有通信均通过 HTTPS 加密。",
  },
  {
    q: "如何联系技术支持？",
    a: "您可以通过控制台提交工单，或发送邮件至 support@dezix.ai。企业用户可获得专属客户经理提供一对一技术支持。",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-black/[0.04]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-[15px] font-medium text-[#1d1d1f]">{q}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#86868b] transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-[15px] text-[#424245]">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <AnimatedSection>
        <AnimatedItem>
          <h1 className="mb-2 text-5xl font-bold leading-[1.05] tracking-[-0.015em] text-[#1d1d1f] md:text-[56px]">常见问题</h1>
        </AnimatedItem>
        <AnimatedItem>
          <p className="mb-8 text-lg text-[#424245]">
            关于 Dezix AI 的常见问题解答
          </p>
        </AnimatedItem>
      </AnimatedSection>
      <AnimatedSection>
        <AnimatedItem>
          <div className="rounded-2xl bg-white shadow-sm">
            <div className="px-6">
              {faqs.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </AnimatedItem>
      </AnimatedSection>
    </div>
  );
}
