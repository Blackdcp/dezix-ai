import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dezix AI — 统一 AI 模型网关",
  description: "一个 API Key，访问所有主流 AI 模型",
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
