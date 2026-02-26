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
import { useTranslations } from "next-intl";
import { getProviderLogo } from "@/components/icons/provider-logos";
import { Copy, Check } from "lucide-react";

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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-1.5 inline-flex items-center rounded p-0.5 text-[#A8A29E] transition-colors hover:text-[#6366F1]"
      title="Copy model ID"
    >
      {copied ? <Check className="h-3 w-3 text-[#059669]" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

export default function ModelListPage() {
  const t = useTranslations("ModelList");
  const tc = useTranslations("Categories");
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
    <div className="mx-auto max-w-7xl px-6 py-16">
      <AnimatedSection>
        <AnimatedItem>
          <h1 className="font-heading mb-3 text-4xl font-bold tracking-tight text-[#1C1917] md:text-5xl">{t("title")}</h1>
        </AnimatedItem>
        <AnimatedItem>
          <p className="mb-10 text-lg text-[#57534E]">
            {t("subtitle")}
          </p>
        </AnimatedItem>
      </AnimatedSection>

      <AnimatedSection>
        <AnimatedItem>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm rounded-xl border-[#E7E5E0] bg-white focus:border-[#6366F1]/50 focus:ring-[#6366F1]/20"
            />
            {categories.length > 0 && (
              <Tabs
                value={activeCategory}
                onValueChange={setActiveCategory}
              >
                <TabsList>
                  <TabsTrigger value="all">{t("all")}</TabsTrigger>
                  {categories.map((c) => (
                    <TabsTrigger key={c} value={c}>
                      {tc(c as string)}
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
            <div key={i} className="h-12 animate-pulse rounded-xl bg-[#F5F3EF]" />
          ))}
        </div>
      ) : (
        <AnimatedSection>
          <AnimatedItem>
            <div className="overflow-x-auto rounded-2xl border border-[#E7E5E0] bg-white">
              <Table>
                <TableHeader className="sticky top-0 z-10">
                  <TableRow className="border-b border-[#E7E5E0] bg-[#F9F8F6]">
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#A8A29E]">{t("name")}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#A8A29E]">{t("modelId")}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#A8A29E]">{t("provider")}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#A8A29E]">{t("category")}</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#A8A29E]">{t("inputPrice")}</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#A8A29E]">{t("outputPrice")}</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#A8A29E]">{t("maxContext")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-10 text-center text-base text-[#A8A29E]"
                      >
                        {t("noResults")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((m) => {
                      const { Logo, color } = getProviderLogo(m.providerName);
                      return (
                        <TableRow key={m.id} className="border-b border-[#E7E5E0] transition-colors hover:bg-[#F9F8F6]/80">
                          <TableCell className="font-medium text-[#1C1917]">
                            {m.displayName}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center font-mono text-xs text-[#A8A29E]">
                              {m.modelId}
                              <CopyButton text={m.modelId} />
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="inline-flex items-center gap-1 rounded-full">
                              <Logo className="h-3 w-3" style={{ color }} />
                              {m.providerName}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-full">{tc(m.category as string)}</Badge>
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-[#57534E]">
                            ¥{(m.sellPrice * 1000).toFixed(2)}/M
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-[#57534E]">
                            ¥{(m.sellOutPrice * 1000).toFixed(2)}/M
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-[#57534E]">
                            {(m.maxContext / 1000).toFixed(0)}K
                          </TableCell>
                        </TableRow>
                      );
                    })
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
