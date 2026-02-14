"use client";

import { useEffect, useState, useCallback } from "react";
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

const typeLabels: Record<string, { label: string; variant: "default" | "destructive" | "secondary" | "outline" }> = {
  TOPUP: { label: "充值", variant: "default" },
  USAGE: { label: "消费", variant: "destructive" },
  REFUND: { label: "退款", variant: "secondary" },
  REFERRAL: { label: "返佣", variant: "outline" },
  ADMIN: { label: "调整", variant: "outline" },
};

const presetAmounts = [10, 50, 100, 500];

export default function BillingPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);

  const [topupAmount, setTopupAmount] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);

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
      toast.error("加载失败");
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchBilling(1);
  }, [fetchBilling]);

  const handleTopup = async (amount: number) => {
    if (amount <= 0 || amount > 10000) {
      toast.error("金额必须在 0.01 ~ 10000 之间");
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
      if (!res.ok) throw new Error(data.error || "充值失败");
      toast.success(`充值成功 ¥${amount.toFixed(2)}`);
      setBalance(data.balance);
      setTopupAmount("");
      fetchBilling(1);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setTopupLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("zh-CN", {
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
      <h1 className="text-2xl font-bold">充值计费</h1>

      {/* Balance Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">账户余额</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            ¥{loading ? "..." : balance.toFixed(2)}
          </div>
          <CardDescription>可用于 API 调用消费</CardDescription>
        </CardContent>
      </Card>

      {/* Topup Area */}
      <Card>
        <CardHeader>
          <CardTitle>模拟充值</CardTitle>
          <CardDescription>选择预设金额或输入自定义金额（无真实支付）</CardDescription>
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
              placeholder="自定义金额"
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
              确认充值
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>交易记录</CardTitle>
          <CardDescription>共 {total} 条记录</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              加载中...
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              暂无交易记录
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">类型</th>
                      <th className="pb-3 pr-4 font-medium">金额</th>
                      <th className="pb-3 pr-4 font-medium">交易后余额</th>
                      <th className="pb-3 pr-4 font-medium">描述</th>
                      <th className="pb-3 font-medium">时间</th>
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
                    第 {page} / {totalPages} 页
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => fetchBilling(page - 1)}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => fetchBilling(page + 1)}
                    >
                      下一页
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
