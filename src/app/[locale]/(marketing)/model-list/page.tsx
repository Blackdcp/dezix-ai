"use client";

import { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AnimatedSection,
  AnimatedItem,
} from "@/components/ui/animated-section";
import { useTranslations } from "next-intl";
import { getProviderLogo } from "@/components/icons/provider-logos";
import { Copy, Check, Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";

interface Model {
  id: string;
  modelId: string;
  displayName: string;
  providerName: string;
  category: string;
  sellPrice: number;
  sellOutPrice: number;
  maxContext: number;
  isNew: boolean;
  createdAt: string;
}

type SortOption = "newest" | "oldest" | "price-asc" | "price-desc" | "context-desc";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-1 inline-flex items-center rounded p-0.5 text-muted-foreground/60 transition-colors hover:text-primary"
      title={label}
    >
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function ContextBadge({ maxContext }: { maxContext: number }) {
  if (maxContext <= 0) return null;
  const k = maxContext / 1000;
  let label: string;
  let colorClass: string;
  if (k >= 1000) {
    label = `${(k / 1000).toFixed(k >= 10000 ? 0 : 1)}M`;
    colorClass = "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  } else if (k >= 128) {
    label = `${k}K`;
    colorClass = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  } else {
    label = `${k}K`;
    colorClass = "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  }
  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${colorClass}`}>
      {label}
    </span>
  );
}

export default function ModelListPage() {
  const t = useTranslations("ModelList");
  const tc = useTranslations("Categories");
  const tp = useTranslations("Providers");
  const [models, setModels] = useState<Model[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeProvider, setActiveProvider] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch("/api/public/models")
      .then((r) => r.json())
      .then((data) => {
        setModels(data.models || []);
        setCategories(data.categories || []);
        setProviders((data.providers || []).map((p: { id: string }) => p.id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = models.filter((m) => {
      const matchCategory = activeCategory === "all" || m.category === activeCategory;
      const matchProvider = activeProvider === "all" || m.providerName === activeProvider;
      const matchSearch =
        !search ||
        m.displayName.toLowerCase().includes(search.toLowerCase()) ||
        m.modelId.toLowerCase().includes(search.toLowerCase()) ||
        m.providerName.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchProvider && matchSearch;
    });

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "price-asc": return a.sellPrice - b.sellPrice;
        case "price-desc": return b.sellPrice - a.sellPrice;
        case "context-desc": return b.maxContext - a.maxContext;
        default: return 0;
      }
    });

    return result;
  }, [models, activeCategory, activeProvider, search, sortBy]);

  const activeFilterCount = [
    activeCategory !== "all" ? 1 : 0,
    activeProvider !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearFilters = () => {
    setActiveCategory("all");
    setActiveProvider("all");
    setSearch("");
    setSortBy("newest");
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of models) {
      counts[m.category] = (counts[m.category] || 0) + 1;
    }
    return counts;
  }, [models]);

  // Provider counts
  const providerCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of models) {
      counts[m.providerName] = (counts[m.providerName] || 0) + 1;
    }
    return counts;
  }, [models]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <AnimatedSection>
        {/* Header */}
        <AnimatedItem>
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              {t("subtitle", { count: models.length })}
            </p>
          </div>
        </AnimatedItem>

        {/* Search + Sort + Filter toggle */}
        <AnimatedItem>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-lg"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-9 appearance-none rounded-lg border border-border bg-card pl-3 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="newest">{t("sortNewest")}</option>
                  <option value="oldest">{t("sortOldest")}</option>
                  <option value="price-asc">{t("sortPriceAsc")}</option>
                  <option value="price-desc">{t("sortPriceDesc")}</option>
                  <option value="context-desc">{t("sortContext")}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              {/* Filter toggle */}
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-1.5"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t("filters")}
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-[10px] font-bold text-primary">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  {t("clearAll")}
                </Button>
              )}
            </div>
          </div>
        </AnimatedItem>

        {/* Filter panel */}
        {showFilters && (
          <AnimatedItem>
            <div className="mb-6 rounded-xl border border-border bg-card p-4 space-y-4">
              {/* Category filter */}
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("category")}</div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setActiveCategory("all")}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      activeCategory === "all"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {t("all")} ({models.length})
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveCategory(c === activeCategory ? "all" : c)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        c === activeCategory
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {tc(c as string)} ({categoryCounts[c] || 0})
                    </button>
                  ))}
                </div>
              </div>
              {/* Provider filter */}
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("provider")}</div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setActiveProvider("all")}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      activeProvider === "all"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {t("all")}
                  </button>
                  {providers.map((p) => {
                    const { Logo, color } = getProviderLogo(p);
                    return (
                      <button
                        key={p}
                        onClick={() => setActiveProvider(p === activeProvider ? "all" : p)}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          p === activeProvider
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        <Logo className="h-3 w-3" style={p === activeProvider ? {} : { color }} />
                        {tp(p)} ({providerCounts[p] || 0})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </AnimatedItem>
        )}

        {/* Results count */}
        <AnimatedItem>
          <div className="mb-3 text-sm text-muted-foreground">
            {t("showing", { count: filtered.length, total: models.length })}
          </div>
        </AnimatedItem>
      </AnimatedSection>

      {/* Model grid */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">{t("noResults")}</p>
          {activeFilterCount > 0 && (
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              {t("clearAll")}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => {
            const { Logo, color } = getProviderLogo(m.providerName);
            return (
              <div
                key={m.id}
                className="group relative rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
              >
                {/* Badges row */}
                <div className="mb-2 flex items-center gap-1.5">
                  {m.isNew && (
                    <span className="rounded-md bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      New
                    </span>
                  )}
                  <Badge variant="outline" className="rounded-md px-1.5 py-0.5 text-[10px]">
                    {tc(m.category as string)}
                  </Badge>
                  <ContextBadge maxContext={m.maxContext} />
                </div>

                {/* Model name + provider */}
                <div className="mb-3">
                  <div className="flex items-center gap-1.5">
                    <Logo className="h-4 w-4 shrink-0" style={{ color }} />
                    <h3 className="text-sm font-semibold text-foreground leading-tight truncate">
                      {m.displayName}
                    </h3>
                  </div>
                  <div className="mt-1 flex items-center">
                    <span className="font-mono text-[11px] text-muted-foreground truncate">
                      {m.modelId}
                    </span>
                    <CopyButton text={m.modelId} label={t("copyModelId")} />
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-1 border-t border-border/50 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t("inputPrice")}</span>
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      ¥{(m.sellPrice * 1000).toFixed(2)} <span className="text-muted-foreground font-normal">/M tokens</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t("outputPrice")}</span>
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      ¥{(m.sellOutPrice * 1000).toFixed(2)} <span className="text-muted-foreground font-normal">/M tokens</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
