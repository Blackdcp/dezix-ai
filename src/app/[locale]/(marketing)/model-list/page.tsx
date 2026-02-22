"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AnimatedSection,
  AnimatedItem,
} from "@/components/ui/animated-section";

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

const categoryLabels: Record<string, string> = {
  chat: "对话",
  multimodal: "多模态",
  code: "代码",
  reasoning: "推理",
  image: "图像",
  embedding: "向量",
  audio: "音频",
  video: "视频",
};

export default function ModelListPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/models")
      .then((r) => r.json())
      .then((data) => {
        setModels(data.models || []);
        setCategories(data.categories || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = models.filter((m) => {
    const matchCategory =
      activeCategory === "all" || m.category === activeCategory;
    const matchSearch =
      !search ||
      m.displayName.toLowerCase().includes(search.toLowerCase()) ||
      m.modelId.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <AnimatedSection>
        <AnimatedItem>
          <h1 className="mb-2 text-5xl font-bold leading-[1.05] tracking-[-0.015em] text-[#1d1d1f] md:text-[56px]">模型列表</h1>
        </AnimatedItem>
        <AnimatedItem>
          <p className="mb-8 text-lg text-[#424245]">
            浏览 Dezix AI 支持的所有 AI 模型及定价信息
          </p>
        </AnimatedItem>
      </AnimatedSection>

      <AnimatedSection>
        <AnimatedItem>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Input
              placeholder="搜索模型名称或 ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm border-black/[0.08] bg-[#f5f5f7] focus:border-[#007AFF]/50 focus:ring-[#007AFF]/20"
            />
            {categories.length > 0 && (
              <Tabs
                value={activeCategory}
                onValueChange={setActiveCategory}
              >
                <TabsList>
                  <TabsTrigger value="all">全部</TabsTrigger>
                  {categories.map((c) => (
                    <TabsTrigger key={c} value={c}>
                      {categoryLabels[c] || c}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>
        </AnimatedItem>
      </AnimatedSection>

      {loading ? (
        <div className="space-y-3 py-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-[#f5f5f7]" />
          ))}
        </div>
      ) : (
        <AnimatedSection>
          <AnimatedItem>
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-black/[0.06] bg-[#f5f5f7]">
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#86868b]">名称</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#86868b]">模型 ID</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#86868b]">供应商</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#86868b]">分类</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#86868b]">输入价格</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#86868b]">输出价格</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#86868b]">最大上下文</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-10 text-center text-base text-[#86868b]"
                      >
                        未找到匹配的模型
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((m) => (
                      <TableRow key={m.id} className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
                        <TableCell className="font-medium text-[#1d1d1f]">
                          {m.displayName}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-[#86868b]">
                          {m.modelId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{m.providerName}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{categoryLabels[m.category] || m.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-[#424245]">
                          ¥{m.sellPrice}/M tokens
                        </TableCell>
                        <TableCell className="text-right text-[#424245]">
                          ¥{m.sellOutPrice}/M tokens
                        </TableCell>
                        <TableCell className="text-right text-[#424245]">
                          {(m.maxContext / 1000).toFixed(0)}K
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </AnimatedItem>
        </AnimatedSection>
      )}
    </div>
  );
}
