"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  type: "TOPUP" | "USAGE" | "REFUND" | "REFERRAL" | "ADMIN";
  amount: number;
  balance: number;
  description: string | null;
  createdAt: string;
}

const presetAmounts = [10, 50, 100, 500];

export default function BillingPage() {
  const t = useTranslations("Billing");
  const tc = useTranslations("Common");
  const te = useTranslations("Errors");
  const locale = useLocale();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);

  const [topupAmount, setTopupAmount] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);

  const typeLabels: Record<string, { label: string; variant: "default" | "destructive" | "secondary" | "outline" }> = {
    TOPUP: { label: t("topupType"), variant: "default" },
    USAGE: { label: t("usageType"), variant: "destructive" },
    REFUND: { label: t("refundType"), variant: "secondary" },
    REFERRAL: { label: t("referralType"), variant: "outline" },
    ADMIN: { label: t("adminType"), variant: "outline" },
  };

  const fetchBilling = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/console/billing?page=${p}&pageSize=${pageSize}`);
      const data = await res.json();
      setBalance(data.balance);
      setTransactions(data.transactions);
      setTotal(data.total);
      setPage(data.page);
    } catch {
      toast.error(t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [pageSize, t]);

  useEffect(() => {
    fetchBilling(1);
  }, [fetchBilling]);

  const handleTopup = async (amount: number) => {
    if (amount <= 0 || amount > 10000) {
      toast.error(t("amountRange"));
      return;
    }
    setTopupLoading(true);
    try {
      const res = await fetch("/api/console/billing/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("topUpFailed"));
      toast.success(t("topUpSuccess", { amount: amount.toFixed(2) }));
      setBalance(data.balance);
      setTopupAmount("");
      fetchBilling(1);
    } catch (err) {
      const errorMsg = (err as Error).message;
      // Try to translate error code from API
      try {
        toast.error(te(errorMsg as Parameters<typeof te>[0]));
      } catch {
        toast.error(errorMsg);
      }
    } finally {
      setTopupLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      {/* Balance Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{t("balance")}</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            ¥{loading ? "..." : balance.toFixed(2)}
          </div>
          <CardDescription>{t("balanceDesc")}</CardDescription>
        </CardContent>
      </Card>

      {/* Topup Area */}
      <Card>
        <CardHeader>
          <CardTitle>{t("topUp")}</CardTitle>
          <CardDescription>{t("topUpDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {presetAmounts.map((amt) => (
              <Button
                key={amt}
                variant="outline"
                disabled={topupLoading}
                onClick={() => handleTopup(amt)}
              >
                ¥{amt}
              </Button>
            ))}
          </div>
          <div className="flex gap-3">
            <Input
              type="number"
              placeholder={t("customPlaceholder")}
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              min={0.01}
              max={10000}
              step={0.01}
            />
            <Button
              disabled={topupLoading || !topupAmount}
              onClick={() => handleTopup(parseFloat(topupAmount))}
            >
              {topupLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {t("confirmTopUp")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>{t("transactions")}</CardTitle>
          <CardDescription>{t("totalRecords", { count: total })}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {tc("loading")}
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              {t("noRecords")}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">{t("type")}</th>
                      <th className="pb-3 pr-4 font-medium">{t("amount")}</th>
                      <th className="pb-3 pr-4 font-medium">{t("balanceAfter")}</th>
                      <th className="pb-3 pr-4 font-medium">{t("description")}</th>
                      <th className="pb-3 font-medium">{t("time")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => {
                      const typeInfo = typeLabels[tx.type] || {
                        label: tx.type,
                        variant: "outline" as const,
                      };
                      return (
                        <tr key={tx.id} className="border-b last:border-0">
                          <td className="py-3 pr-4">
                            <Badge variant={typeInfo.variant}>
                              {typeInfo.label}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={
                                tx.amount >= 0
                                  ? "font-medium text-green-600"
                                  : "font-medium text-red-600"
                              }
                            >
                              {tx.amount >= 0 ? "+" : ""}
                              ¥{tx.amount.toFixed(6)}
                            </span>
                          </td>
                          <td className="py-3 pr-4">¥{tx.balance.toFixed(2)}</td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            {tx.description || "-"}
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {formatTime(tx.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("page", { current: page, total: totalPages })}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => fetchBilling(page - 1)}
                    >
                      {t("prevPage")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => fetchBilling(page + 1)}
                    >
                      {t("nextPage")}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
