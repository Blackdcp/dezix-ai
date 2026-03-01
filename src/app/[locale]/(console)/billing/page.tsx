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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Transaction {
  id: string;
  type: "TOPUP" | "USAGE" | "REFUND" | "REFERRAL" | "ADMIN";
  amount: number;
  balance: number;
  description: string | null;
  createdAt: string;
}

interface TopupOrder {
  id: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  remark: string | null;
  adminRemark: string | null;
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
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Topup orders
  const [orders, setOrders] = useState<TopupOrder[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersLoading, setOrdersLoading] = useState(true);

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

  const fetchOrders = useCallback(async (p: number) => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`/api/console/billing/topup-order?page=${p}&pageSize=10`);
      const data = await res.json();
      setOrders(data.orders);
      setOrdersTotal(data.total);
      setOrdersPage(data.page);
    } catch {
      toast.error(t("loadFailed"));
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBilling(1);
    fetchOrders(1);
  }, [fetchBilling, fetchOrders]);

  const openQrDialog = (amount: number) => {
    if (amount <= 0 || amount > 10000) {
      toast.error(t("amountRange"));
      return;
    }
    setSelectedAmount(Math.round(amount * 100) / 100);
    setQrDialogOpen(true);
  };

  const handleSubmitOrder = async () => {
    if (!selectedAmount) return;
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/console/billing/topup-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("orderSubmitFailed"));
      toast.success(t("orderSubmitted"));
      setQrDialogOpen(false);
      setTopupAmount("");
      setSelectedAmount(null);
      fetchOrders(1);
    } catch (err) {
      const errorMsg = (err as Error).message;
      try {
        toast.error(te(errorMsg as Parameters<typeof te>[0]));
      } catch {
        toast.error(errorMsg);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);
  const ordersTotalPages = Math.ceil(ordersTotal / 10);

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

  const statusBadge = (status: TopupOrder["status"]) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">{t("statusPending")}</Badge>;
      case "APPROVED":
        return <Badge variant="default">{t("statusApproved")}</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">{t("statusRejected")}</Badge>;
    }
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

      {/* Topup Area — WeChat QR */}
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
                onClick={() => openQrDialog(amt)}
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
              disabled={!topupAmount}
              onClick={() => openQrDialog(parseFloat(topupAmount))}
            >
              {t("confirmTopUp")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("qrTitle")}</DialogTitle>
            <DialogDescription>
              {t("qrDesc", { amount: selectedAmount?.toFixed(2) || "0" })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative h-64 w-64 overflow-hidden rounded-lg border">
              <Image
                src="/wechat-qr.jpg"
                alt="WeChat QR Code"
                fill
                className="object-contain"
              />
            </div>
            <div className="text-center text-2xl font-bold text-primary">
              ¥{selectedAmount?.toFixed(2)}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {t("qrTip")}
            </p>
            <Button
              className="w-full"
              size="lg"
              disabled={submitLoading}
              onClick={handleSubmitOrder}
            >
              {submitLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {submitLoading ? t("submitting") : t("iPaid")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* My Topup Orders */}
      <Card>
        <CardHeader>
          <CardTitle>{t("myOrders")}</CardTitle>
          <CardDescription>{t("myOrdersDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {tc("loading")}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              {t("noOrders")}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">{t("orderAmount")}</th>
                      <th className="pb-3 pr-4 font-medium">{t("orderStatus")}</th>
                      <th className="pb-3 pr-4 font-medium">{t("orderRemark")}</th>
                      <th className="pb-3 font-medium">{t("orderTime")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium">¥{order.amount.toFixed(2)}</td>
                        <td className="py-3 pr-4">{statusBadge(order.status)}</td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {order.status === "REJECTED" && order.adminRemark
                            ? t("rejectedReason", { reason: order.adminRemark })
                            : order.remark || "-"}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {formatTime(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {ordersTotalPages > 1 && (
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={ordersPage <= 1}
                    onClick={() => fetchOrders(ordersPage - 1)}
                  >
                    {t("prevPage")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={ordersPage >= ordersTotalPages}
                    onClick={() => fetchOrders(ordersPage + 1)}
                  >
                    {t("nextPage")}
                  </Button>
                </div>
              )}
            </>
          )}
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
