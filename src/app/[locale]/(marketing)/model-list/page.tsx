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
          <h1 className="font-heading mb-3 text-4xl font-bold tracking-tight text-[#1a1a2e] md:text-5xl">{t("title")}</h1>
        </AnimatedItem>
        <AnimatedItem>
          <p className="mb-10 text-lg text-[#52525b]">
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
              className="max-w-sm rounded-xl border-[#e4e4e7] bg-white focus:border-[#7C5CFC]/50 focus:ring-[#7C5CFC]/20"
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
            <div key={i} className="h-12 animate-pulse rounded-xl bg-[#f4f4f5]" />
          ))}
        </div>
      ) : (
        <AnimatedSection>
          <AnimatedItem>
            <div className="overflow-hidden rounded-2xl border border-[#e4e4e7] bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#e4e4e7] bg-[#fafafa]">
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#a1a1aa]">{t("name")}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#a1a1aa]">{t("modelId")}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#a1a1aa]">{t("provider")}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-medium text-[#a1a1aa]">{t("category")}</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#a1a1aa]">{t("inputPrice")}</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#a1a1aa]">{t("outputPrice")}</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider font-medium text-[#a1a1aa]">{t("maxContext")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-10 text-center text-base text-[#a1a1aa]"
                      >
                        {t("noResults")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((m) => (
                      <TableRow key={m.id} className="border-b border-[#e4e4e7] hover:bg-[#fafafa]/50">
                        <TableCell className="font-medium text-[#1a1a2e]">
                          {m.displayName}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-[#a1a1aa]">
                          {m.modelId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="rounded-full">{m.providerName}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-full">{tc(m.category as string)}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-[#52525b]">
                          ¥{m.sellPrice}/M tokens
                        </TableCell>
                        <TableCell className="text-right text-[#52525b]">
                          ¥{m.sellOutPrice}/M tokens
                        </TableCell>
                        <TableCell className="text-right text-[#52525b]">
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
