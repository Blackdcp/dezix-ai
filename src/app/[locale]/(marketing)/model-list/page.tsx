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
          <h1 className="font-heading mb-3 text-4xl font-bold tracking-tight text-[#0f1729] md:text-5xl">{t("title")}</h1>
        </AnimatedItem>
        <AnimatedItem>
          <p className="mb-10 text-lg text-[#3d4663]">
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
              className="max-w-sm rounded-[10px] border-[var(--border)] bg-white focus:border-[#2563eb]/50 focus:ring-[#2563eb]/20"
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
            <div key={i} className="h-12 animate-pulse rounded-lg bg-[#f0f2f5]" />
          ))}
        </div>
      ) : (
        <AnimatedSection>
          <AnimatedItem>
            <div className="overflow-hidden rounded-[14px] border border-[var(--border)] bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[var(--border)] bg-[#f8f9fb]">
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#7c8299]">{t("name")}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#7c8299]">{t("modelId")}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#7c8299]">{t("provider")}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#7c8299]">{t("category")}</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#7c8299]">{t("inputPrice")}</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#7c8299]">{t("outputPrice")}</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#7c8299]">{t("maxContext")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-10 text-center text-base text-[#7c8299]"
                      >
                        {t("noResults")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((m) => (
                      <TableRow key={m.id} className="border-b border-[var(--border)] hover:bg-[#f8f9fb]/50">
                        <TableCell className="font-medium text-[#0f1729]">
                          {m.displayName}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-[#7c8299]">
                          {m.modelId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="rounded-md">{m.providerName}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-md">{tc(m.category as string)}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-[#3d4663]">
                          ¥{m.sellPrice}/M tokens
                        </TableCell>
                        <TableCell className="text-right text-[#3d4663]">
                          ¥{m.sellOutPrice}/M tokens
                        </TableCell>
                        <TableCell className="text-right text-[#3d4663]">
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
