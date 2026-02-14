import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          一个 API Key
          <br />
          <span className="text-primary">访问所有主流 AI 模型</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Dezix AI 统一网关让您通过 OpenAI 兼容接口，轻松调用 OpenAI、Anthropic、Google、DeepSeek 等多家模型，按量付费，透明计费。
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/register">免费开始</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/docs/quick-start">查看文档</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
