"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AnimatedSection,
  AnimatedItem,
} from "@/components/ui/animated-section";
import { useTranslations } from "next-intl";
import { getProviderLogo } from "@/components/icons/provider-logos";
import {
  Copy,
  Check,
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  Flame,
  Sparkles,
  Gift,
} from "lucide-react";
import type { BadgeType, FeatureTag, IOType } from "@/lib/model-metadata";

// ============================================================
// Types
// ============================================================

interface Model {
  id: string;
  modelId: string;
  displayName: string;
  providerName: string;
  category: string;
  sellPrice: number;
  sellOutPrice: number;
  maxContext: number;
  badges: BadgeType[];
  features: FeatureTag[];
  inputTypes: IOType[];
  outputTypes: IOType[];
  createdAt: string;
}

type SortOption =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "context-desc";

// ============================================================
// Sub-components
// ============================================================

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
      className="ml-1.5 inline-flex items-center rounded p-1 text-muted-foreground/50 transition-colors hover:bg-muted hover:text-primary"
      title={label}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function ModelBadge({ type, label }: { type: BadgeType; label: string }) {
  const styles: Record<BadgeType, string> = {
    new: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    hot: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    free: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    "limited-free":
      "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  };
  const icons: Record<BadgeType, React.ReactNode> = {
    new: <Sparkles className="h-3 w-3" />,
    hot: <Flame className="h-3 w-3" />,
    free: <Gift className="h-3 w-3" />,
    "limited-free": <Gift className="h-3 w-3" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[11px] font-bold ${styles[type]}`}
    >
      {icons[type]}
      {label}
    </span>
  );
}

function ContextBadge({ maxContext }: { maxContext: number }) {
  if (maxContext <= 0) return null;
  const k = maxContext / 1000;
  let label: string;
  let colorClass: string;
  if (k >= 1000) {
    label = `${(k / 1000).toFixed(k >= 10000 ? 0 : 1)}M`;
    colorClass =
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
  } else if (k >= 128) {
    label = `${k}K`;
    colorClass =
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  } else {
    label = `${k}K`;
    colorClass = "bg-muted text-muted-foreground";
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${colorClass}`}
    >
      {label}
    </span>
  );
}

function FeaturePill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border/50 bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground">
      {label}
    </span>
  );
}

// ============================================================
// Filter sidebar
// ============================================================

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

function PillToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function ProviderCheckbox({
  brandKey,
  displayName,
  count,
  checked,
  onChange,
}: {
  brandKey: string;
  displayName: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  const { Logo } = getProviderLogo(brandKey);
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-border text-primary accent-primary"
      />
      <Logo className="h-4 w-4 shrink-0 rounded-sm" />
      <span className="flex-1 text-sm text-foreground">{displayName}</span>
      <span className="text-xs text-muted-foreground">{count}</span>
    </label>
  );
}

// ============================================================
// Main page
// ============================================================

export default function ModelListPage() {
  const t = useTranslations("ModelList");
  const tc = useTranslations("Categories");
  const tp = useTranslations("Providers");
  const tf = useTranslations("Features");

  const [models, setModels] = useState<Model[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    new Set()
  );
  const [activeProviders, setActiveProviders] = useState<Set<string>>(
    new Set()
  );
  const [activeInputTypes, setActiveInputTypes] = useState<Set<string>>(
    new Set()
  );
  const [activeOutputTypes, setActiveOutputTypes] = useState<Set<string>>(
    new Set()
  );
  const [activeFeatures, setActiveFeatures] = useState<Set<string>>(
    new Set()
  );
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetch("/api/public/models")
      .then((r) => r.json())
      .then((data) => {
        setModels(data.models || []);
        setCategories(data.categories || []);
        setProviders(
          (data.providers || []).map((p: { id: string }) => p.id)
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleSet = useCallback(
    (
      setter: React.Dispatch<React.SetStateAction<Set<string>>>,
      value: string
    ) => {
      setter((prev) => {
        const next = new Set(prev);
        if (next.has(value)) next.delete(value);
        else next.add(value);
        return next;
      });
    },
    []
  );

  // Filtered + sorted
  const filtered = useMemo(() => {
    let result = models.filter((m) => {
      if (activeCategories.size > 0 && !activeCategories.has(m.category))
        return false;
      if (activeProviders.size > 0 && !activeProviders.has(m.providerName))
        return false;
      if (
        activeInputTypes.size > 0 &&
        !m.inputTypes.some((t) => activeInputTypes.has(t))
      )
        return false;
      if (
        activeOutputTypes.size > 0 &&
        !m.outputTypes.some((t) => activeOutputTypes.has(t))
      )
        return false;
      if (
        activeFeatures.size > 0 &&
        !m.features.some((f) => activeFeatures.has(f))
      )
        return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !m.displayName.toLowerCase().includes(q) &&
          !m.modelId.toLowerCase().includes(q) &&
          !m.providerName.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "price-asc":
          return a.sellPrice - b.sellPrice;
        case "price-desc":
          return b.sellPrice - a.sellPrice;
        case "context-desc":
          return b.maxContext - a.maxContext;
        default:
          return 0;
      }
    });

    return result;
  }, [
    models,
    activeCategories,
    activeProviders,
    activeInputTypes,
    activeOutputTypes,
    activeFeatures,
    search,
    sortBy,
  ]);

  const activeFilterCount =
    activeCategories.size +
    activeProviders.size +
    activeInputTypes.size +
    activeOutputTypes.size +
    activeFeatures.size;

  const clearFilters = useCallback(() => {
    setActiveCategories(new Set());
    setActiveProviders(new Set());
    setActiveInputTypes(new Set());
    setActiveOutputTypes(new Set());
    setActiveFeatures(new Set());
    setSearch("");
    setSortBy("newest");
  }, []);

  // Provider counts
  const providerCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of models)
      counts[m.providerName] = (counts[m.providerName] || 0) + 1;
    return counts;
  }, [models]);

  // Derived filter lists
  const allFeatures = useMemo(() => {
    const feats = new Set<string>();
    for (const m of models) for (const f of m.features) feats.add(f);
    return Array.from(feats).sort();
  }, [models]);

  const allInputTypes = useMemo(() => {
    const types = new Set<string>();
    for (const m of models) for (const t of m.inputTypes) types.add(t);
    return Array.from(types).sort();
  }, [models]);

  const allOutputTypes = useMemo(() => {
    const types = new Set<string>();
    for (const m of models) for (const t of m.outputTypes) types.add(t);
    return Array.from(types).sort();
  }, [models]);

  const badgeLabel = useCallback(
    (type: BadgeType) => {
      const map: Record<BadgeType, string> = {
        new: t("badgeNew"),
        hot: t("badgeHot"),
        free: t("badgeFree"),
        "limited-free": t("badgeLimitedFree"),
      };
      return map[type];
    },
    [t]
  );

  // ============================================================
  // Filter sidebar content
  // ============================================================

  const filterContent = (
    <div className="space-y-6">
      {/* Input Types */}
      <FilterSection title={t("inputTypes")}>
        <div className="flex flex-wrap gap-1.5">
          {allInputTypes.map((type) => (
            <PillToggle
              key={type}
              active={activeInputTypes.has(type)}
              onClick={() => toggleSet(setActiveInputTypes, type)}
            >
              {tf(type)}
            </PillToggle>
          ))}
        </div>
      </FilterSection>

      {/* Output Types */}
      <FilterSection title={t("outputTypes")}>
        <div className="flex flex-wrap gap-1.5">
          {allOutputTypes.map((type) => (
            <PillToggle
              key={type}
              active={activeOutputTypes.has(type)}
              onClick={() => toggleSet(setActiveOutputTypes, type)}
            >
              {tf(type)}
            </PillToggle>
          ))}
        </div>
      </FilterSection>

      {/* Category */}
      <FilterSection title={t("category")}>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <PillToggle
              key={c}
              active={activeCategories.has(c)}
              onClick={() => toggleSet(setActiveCategories, c)}
            >
              {tc(c)}
            </PillToggle>
          ))}
        </div>
      </FilterSection>

      {/* Model Features */}
      <FilterSection title={t("modelFeatures")}>
        <div className="flex flex-wrap gap-1.5">
          {allFeatures.map((f) => (
            <PillToggle
              key={f}
              active={activeFeatures.has(f)}
              onClick={() => toggleSet(setActiveFeatures, f)}
            >
              {tf(f)}
            </PillToggle>
          ))}
        </div>
      </FilterSection>

      {/* Providers */}
      <FilterSection title={t("provider")}>
        <div className="-mx-1 space-y-0.5">
          {providers.map((p) => (
            <ProviderCheckbox
              key={p}
              brandKey={p}
              displayName={tp(p)}
              count={providerCounts[p] || 0}
              checked={activeProviders.has(p)}
              onChange={() => toggleSet(setActiveProviders, p)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Clear all */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="w-full text-muted-foreground"
        >
          {t("clearAll")}
        </Button>
      )}
    </div>
  );

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <AnimatedSection>
        {/* Header */}
        <AnimatedItem>
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-2 text-base text-muted-foreground sm:text-lg">
              {t("subtitle", { count: models.length })}
            </p>
          </div>
        </AnimatedItem>

        {/* Search + Sort bar */}
        <AnimatedItem>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-lg flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-10 text-sm rounded-lg"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as SortOption)
                  }
                  className="h-10 appearance-none rounded-lg border border-border bg-card pl-3 pr-9 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="newest">{t("sortNewest")}</option>
                  <option value="oldest">{t("sortOldest")}</option>
                  <option value="price-asc">{t("sortPriceAsc")}</option>
                  <option value="price-desc">{t("sortPriceDesc")}</option>
                  <option value="context-desc">{t("sortContext")}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              {/* Mobile filter toggle */}
              <Button
                variant={showMobileFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="h-10 gap-1.5 lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t("filters")}
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-[10px] font-bold text-primary">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              {/* Results count */}
              <span className="hidden text-sm text-muted-foreground lg:inline">
                {t("showing", {
                  count: filtered.length,
                  total: models.length,
                })}
              </span>
            </div>
          </div>
        </AnimatedItem>
      </AnimatedSection>

      {/* Mobile filter panel */}
      {showMobileFilters && (
        <div className="mb-6 rounded-xl border border-border bg-card p-5 lg:hidden">
          {filterContent}
        </div>
      )}

      {/* Main layout: sidebar + grid */}
      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-xl border border-border bg-card p-5">
            {filterContent}
          </div>
        </aside>

        {/* Model grid */}
        <div className="min-w-0 flex-1">
          {/* Mobile results count */}
          <div className="mb-4 text-sm text-muted-foreground lg:hidden">
            {t("showing", { count: filtered.length, total: models.length })}
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-2xl bg-muted"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-lg font-medium text-foreground">
                {t("noResults")}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("tryAdjustFilters")}
              </p>
              {activeFilterCount > 0 && (
                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={clearFilters}
                >
                  {t("clearAll")}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((m) => {
                const { Logo } = getProviderLogo(m.providerName);
                return (
                  <div
                    key={m.id}
                    className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg"
                  >
                    {/* Header: logo + name + badges */}
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                        <Logo className="h-7 w-7 rounded-md" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold leading-snug text-foreground">
                          {m.displayName}
                        </h3>
                        <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                          {m.badges.map((b) => (
                            <ModelBadge
                              key={b}
                              type={b}
                              label={badgeLabel(b)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Model ID */}
                    <div className="mb-3 flex items-center">
                      <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground truncate">
                        {m.modelId}
                      </code>
                      <CopyButton
                        text={m.modelId}
                        label={t("copyModelId")}
                      />
                    </div>

                    {/* Feature pills + context badge */}
                    <div className="mb-3 flex flex-wrap items-center gap-1.5">
                      {m.features.map((f) => (
                        <FeaturePill key={f} label={tf(f)} />
                      ))}
                      <ContextBadge maxContext={m.maxContext} />
                    </div>

                    {/* Provider */}
                    <div className="mb-3 text-xs text-muted-foreground">
                      {tp(m.providerName)}
                    </div>

                    {/* Pricing */}
                    <div className="mt-auto space-y-1.5 border-t border-border/60 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {t("inputPrice")}
                        </span>
                        <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                          ¥{(m.sellPrice * 1000).toFixed(2)}
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            /M tokens
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {t("outputPrice")}
                        </span>
                        <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                          ¥{(m.sellOutPrice * 1000).toFixed(2)}
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            /M tokens
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
