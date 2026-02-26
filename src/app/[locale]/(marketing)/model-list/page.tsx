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
      className="ml-1.5 inline-flex items-center rounded p-0.5 text-[#a1a1aa] transition-colors hover:text-[#7C5CFC]"
      title="Copy model ID"
    >
      {copied ? <Check className="h-3 w-3 text-[#2DB574]" /> : <Copy className="h-3 w-3" />}
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
            <div className="overflow-x-auto rounded-2xl border border-[#e4e4e7] bg-white">
              <Table>
                <TableHeader className="sticky top-0 z-10">
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
                    filtered.map((m) => {
                      const { Logo, color } = getProviderLogo(m.providerName);
                      return (
                        <TableRow key={m.id} className="border-b border-[#e4e4e7] transition-colors hover:bg-[#fafafa]/80">
                          <TableCell className="font-medium text-[#1a1a2e]">
                            {m.displayName}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center font-mono text-xs text-[#a1a1aa]">
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
                          <TableCell className="text-right tabular-nums text-[#52525b]">
                            ¥{(m.sellPrice * 1000).toFixed(2)}/M
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-[#52525b]">
                            ¥{(m.sellOutPrice * 1000).toFixed(2)}/M
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-[#52525b]">
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
