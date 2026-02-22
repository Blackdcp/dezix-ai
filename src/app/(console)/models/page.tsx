"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Play, MessageSquare } from "lucide-react";

interface ModelItem {
  id: string;
  modelId: string;
  displayName: string;
  providerName: string;
  providerId: string;
  category: string;
  sellPrice: number;
  sellOutPrice: number;
  maxContext: number;
  isActive: boolean;
}

interface ProviderItem {
  id: string;
  name: string;
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

function formatPrice(price: number): string {
  // Price is per 1K tokens, convert to per 1M tokens for display
  return (price * 1000).toFixed(2);
}

function formatContext(ctx: number): string {
  if (ctx >= 1000000) return `${(ctx / 1000000).toFixed(1)}M`;
  if (ctx >= 1000) return `${Math.round(ctx / 1000)}K`;
  return String(ctx);
}

export default function ModelsPage() {
  const router = useRouter();
  const [models, setModels] = useState<ModelItem[]>([]);
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [provider, setProvider] = useState("all");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchModels = useCallback(
    async (searchQuery: string, cat: string, prov: string) => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (cat && cat !== "all") params.set("category", cat);
      if (prov && prov !== "all") params.set("provider", prov);

      try {
        const res = await fetch(`/api/console/models?${params}`);
        if (res.ok) {
          const data = await res.json();
          setModels(data.models);
          setProviders(data.providers);
          setCategories(data.categories);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchModels("", "all", "all");
  }, [fetchModels]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchModels(value, category, provider);
    }, 300);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    fetchModels(search, value, provider);
  };

  const handleProviderChange = (value: string) => {
    setProvider(value);
    fetchModels(search, category, value);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">模型市场</h1>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索模型名称或 ID..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {categoryLabels[c] || c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={provider} onValueChange={handleProviderChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="供应商" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部供应商</SelectItem>
            {providers.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model Grid */}
      {loading ? (
        <div className="py-12 text-center text-muted-foreground">加载中...</div>
      ) : models.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          没有找到匹配的模型
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => (
            <Card key={model.id} className="relative flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">
                    {model.displayName}
                  </CardTitle>
                  <Badge
                    variant={model.isActive ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {model.isActive ? "可用" : "不可用"}
                  </Badge>
                </div>
                <code className="text-xs text-muted-foreground">
                  {model.modelId}
                </code>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline">{model.providerName}</Badge>
                  <Badge variant="outline">
                    {categoryLabels[model.category] || model.category}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">输入价格</p>
                    <p className="font-medium">
                      ¥{formatPrice(model.sellPrice)}/1M
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">输出价格</p>
                    <p className="font-medium">
                      ¥{formatPrice(model.sellOutPrice)}/1M
                    </p>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">最大上下文: </span>
                  <span className="font-medium">
                    {formatContext(model.maxContext)} tokens
                  </span>
                </div>
                {/* Action buttons */}
                <div className="mt-auto flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={!model.isActive}
                    onClick={() =>
                      router.push(
                        `/playground?model=${encodeURIComponent(model.modelId)}`
                      )
                    }
                  >
                    <Play className="mr-1.5 h-3.5 w-3.5" />
                    Playground
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={!model.isActive}
                    onClick={() =>
                      router.push(
                        `/chat?model=${encodeURIComponent(model.modelId)}`
                      )
                    }
                  >
                    <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                    对话
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
