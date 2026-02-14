import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dezix AI — 统一 AI 模型网关",
  description:
    "一个 API Key，访问所有主流 AI 模型。支持 OpenAI、Anthropic、Google、DeepSeek，100% OpenAI 兼容接口，按量付费，透明计费。",
  keywords: [
    "AI 网关",
    "OpenAI API",
    "Claude API",
    "Gemini API",
    "DeepSeek API",
    "统一 AI 接口",
    "LLM 代理",
    "AI 模型聚合",
    "Dezix AI",
  ],
  openGraph: {
    title: "Dezix AI — 统一 AI 模型网关",
    description: "一个 API Key，访问所有主流 AI 模型",
    type: "website",
    locale: "zh_CN",
    siteName: "Dezix AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dezix AI — 统一 AI 模型网关",
    description: "一个 API Key，访问所有主流 AI 模型",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
