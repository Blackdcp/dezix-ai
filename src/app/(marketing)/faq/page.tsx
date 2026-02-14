"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Dezix AI 是什么？",
    a: "Dezix AI 是一个统一的 AI 模型 API 网关平台。通过一个 API Key，您可以访问 OpenAI、Anthropic、Google、DeepSeek 等多家供应商的 AI 模型，无需分别注册和管理多个平台的账号和密钥。",
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
    a: "目前支持 OpenAI（GPT-4o、GPT-4o-mini）、Anthropic（Claude 3.5 Sonnet）、Google（Gemini 1.5 Pro、Gemini 1.5 Flash）、DeepSeek（DeepSeek Chat、DeepSeek Coder）等主流模型。我们会持续更新支持的模型列表。",
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
    <div className="border-b">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-medium">{q}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="pb-4 text-sm text-muted-foreground">{a}</div>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">常见问题</h1>
      <p className="mb-8 text-muted-foreground">
        关于 Dezix AI 的常见问题解答
      </p>
      <div className="rounded-lg border">
        <div className="px-6">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </div>
  );
}
