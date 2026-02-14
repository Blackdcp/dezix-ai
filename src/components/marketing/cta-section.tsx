import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">
          立即开始使用 Dezix AI
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          注册即可获得免费体验额度，几分钟内完成接入，开始调用全球主流 AI 模型。
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/register">免费注册</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/docs/quick-start">阅读文档</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
