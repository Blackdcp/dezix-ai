"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
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
import { getProviderLogo } from "@/components/icons/provider-logos";

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

function formatPrice(price: number): string {
  return (price * 1000).toFixed(2);
}

function formatContext(ctx: number): string {
  if (ctx >= 1000000) return `${(ctx / 1000000).toFixed(1)}M`;
  if (ctx >= 1000) return `${Math.round(ctx / 1000)}K`;
  return String(ctx);
}

function ModelSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="h-5 w-32 animate-pulse rounded bg-[#F5F3EF]" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-[#F5F3EF]" />
        </div>
        <div className="mt-2 h-3 w-40 animate-pulse rounded bg-[#F5F3EF]" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-5 w-24 animate-pulse rounded-full bg-[#F5F3EF]" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-10 animate-pulse rounded bg-[#F5F3EF]" />
          <div className="h-10 animate-pulse rounded bg-[#F5F3EF]" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ModelsPage() {
  const t = useTranslations("ConsoleModels");
  const tCat = useTranslations("Categories");
  const tp = useTranslations("Providers");
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
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder={t("categoryPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allCategories")}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {tCat(c as "chat" | "multimodal" | "code" | "reasoning" | "image" | "embedding" | "audio" | "video")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={provider} onValueChange={handleProviderChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder={t("providerPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allProviders")}</SelectItem>
            {providers.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {tp(p.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ModelSkeleton key={i} />
          ))}
        </div>
      ) : models.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          {t("noResults")}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => {
            const { Logo, color } = getProviderLogo(model.providerName);
            return (
              <Card key={model.id} className="relative flex flex-col transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">
                      {model.displayName}
                    </CardTitle>
                    <Badge
                      variant={model.isActive ? "default" : "secondary"}
                      className={model.isActive ? "shrink-0 bg-[#16A34A] hover:bg-[#249960]" : "shrink-0"}
                    >
                      {model.isActive ? t("available") : t("unavailable")}
                    </Badge>
                  </div>
                  <code className="text-xs text-muted-foreground">
                    {model.modelId}
                  </code>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="inline-flex items-center gap-1">
                      <Logo className="h-3 w-3" style={{ color }} />
                      {tp(model.providerName)}
                    </Badge>
                    <Badge variant="outline">
                      {tCat(model.category as "chat" | "multimodal" | "code" | "reasoning" | "image" | "embedding" | "audio" | "video")}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t("inputPrice")}</p>
                      <p className="font-medium tabular-nums">
                        ¥{formatPrice(model.sellPrice)}/1M
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("outputPrice")}</p>
                      <p className="font-medium tabular-nums">
                        ¥{formatPrice(model.sellOutPrice)}/1M
                      </p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">{t("maxContext")}</span>
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
                      {t("playgroundButton")}
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
                      {t("chatButton")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
