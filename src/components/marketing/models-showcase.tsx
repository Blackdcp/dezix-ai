"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Model {
  id: string;
  modelId: string;
  displayName: string;
  providerName: string;
  category: string;
  sellPrice: number;
  sellOutPrice: number;
  maxContext: number;
}

export function ModelsShowcase() {
  const [models, setModels] = useState<Model[]>([]);

  useEffect(() => {
    fetch("/api/public/models")
      .then((r) => r.json())
      .then((data) => {
        if (data.models) {
          setModels(data.models.slice(0, 8));
        }
      })
      .catch(() => {});
  }, []);

  if (models.length === 0) {
    return null;
  }

  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold">热门模型</h2>
        <p className="mb-12 text-center text-muted-foreground">
          通过 Dezix AI 统一接口访问以下模型
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {models.map((m) => (
            <div
              key={m.id}
              className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">{m.displayName}</span>
                <Badge variant="secondary" className="text-xs">
                  {m.providerName}
                </Badge>
              </div>
              <p className="mb-3 font-mono text-xs text-muted-foreground">
                {m.modelId}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  ¥{m.sellPrice}/M 输入
                </span>
                <span>{(m.maxContext / 1000).toFixed(0)}K 上下文</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/model-list"
            className="text-sm font-medium text-primary hover:underline"
          >
            查看全部模型 &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
