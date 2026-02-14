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
      <h1 className="mb-2 text-3xl font-bold">模型列表</h1>
      <p className="mb-8 text-muted-foreground">
        浏览 Dezix AI 支持的所有 AI 模型及定价信息
      </p>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="搜索模型名称或 ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
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
                  {c}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">
          加载中...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>模型 ID</TableHead>
                <TableHead>供应商</TableHead>
                <TableHead>分类</TableHead>
                <TableHead className="text-right">输入价格</TableHead>
                <TableHead className="text-right">输出价格</TableHead>
                <TableHead className="text-right">最大上下文</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-muted-foreground"
                  >
                    未找到匹配的模型
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      {m.displayName}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {m.modelId}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{m.providerName}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{m.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ¥{m.sellPrice}/M tokens
                    </TableCell>
                    <TableCell className="text-right">
                      ¥{m.sellOutPrice}/M tokens
                    </TableCell>
                    <TableCell className="text-right">
                      {(m.maxContext / 1000).toFixed(0)}K
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
