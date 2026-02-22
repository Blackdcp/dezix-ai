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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TopupOrder {
  id: string;
  userId: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  remark: string | null;
  adminRemark: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export default function AdminOrdersPage() {
  const t = useTranslations("AdminOrders");
  const tc = useTranslations("Common");
  const locale = useLocale();

  const [orders, setOrders] = useState<TopupOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Reject dialog
  const [rejectOrder, setRejectOrder] = useState<TopupOrder | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  // Approve dialog
  const [approveOrder, setApproveOrder] = useState<TopupOrder | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);

  const fetchOrders = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(p),
        pageSize: String(pageSize),
      });
      if (search) params.set("search", search);
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders);
      setTotal(data.total);
      setPage(data.page);
    } catch {
      toast.error(t("operationFailed"));
    } finally {
      setLoading(false);
    }
  }, [pageSize, search, statusFilter, t]);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const handleApprove = async () => {
    if (!approveOrder) return;
    setApproveLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${approveOrder.id}/approve`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("operationFailed"));
      }
      toast.success(t("approveSuccess"));
      setApproveOrder(null);
      fetchOrders(page);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectOrder || !rejectReason.trim()) return;
    setRejectLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${rejectOrder.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminRemark: rejectReason.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("operationFailed"));
      }
      toast.success(t("rejectSuccess"));
      setRejectOrder(null);
      setRejectReason("");
      fetchOrders(page);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setRejectLoading(false);
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          className="max-w-xs"
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchOrders(1)}
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t("allStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatus")}</SelectItem>
            <SelectItem value="PENDING">{t("statusPending")}</SelectItem>
            <SelectItem value="APPROVED">{t("statusApproved")}</SelectItem>
            <SelectItem value="REJECTED">{t("statusRejected")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("orderList")}</CardTitle>
          <CardDescription>{t("totalCount", { count: total })}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
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
                      <th className="pb-3 pr-4 font-medium">{t("user")}</th>
                      <th className="pb-3 pr-4 font-medium">{t("amount")}</th>
                      <th className="pb-3 pr-4 font-medium">{t("status")}</th>
                      <th className="pb-3 pr-4 font-medium">{t("remark")}</th>
                      <th className="pb-3 pr-4 font-medium">{t("time")}</th>
                      <th className="pb-3 font-medium">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0">
                        <td className="py-3 pr-4">
                          <div>
                            <div className="font-medium">{order.user.name || "-"}</div>
                            <div className="text-xs text-muted-foreground">{order.user.email}</div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 font-medium">¥{order.amount.toFixed(2)}</td>
                        <td className="py-3 pr-4">{statusBadge(order.status)}</td>
                        <td className="py-3 pr-4 text-muted-foreground max-w-48 truncate">
                          {order.adminRemark || order.remark || "-"}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {formatTime(order.createdAt)}
                        </td>
                        <td className="py-3">
                          {order.status === "PENDING" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => setApproveOrder(order)}
                              >
                                {t("approve")}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setRejectOrder(order);
                                  setRejectReason("");
                                }}
                              >
                                {t("reject")}
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => fetchOrders(page - 1)}
                  >
                    {t("prevPage")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => fetchOrders(page + 1)}
                  >
                    {t("nextPage")}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Approve Confirmation Dialog */}
      <Dialog open={!!approveOrder} onOpenChange={(open) => !open && setApproveOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("approveConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("approveConfirmDesc", { amount: approveOrder?.amount.toFixed(2) || "0" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOrder(null)}>
              {t("cancel")}
            </Button>
            <Button disabled={approveLoading} onClick={handleApprove}>
              {approveLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("confirmApprove")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectOrder} onOpenChange={(open) => !open && setRejectOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rejectTitle")}</DialogTitle>
            <DialogDescription>{t("rejectDesc")}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder={t("rejectReasonPlaceholder")}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOrder(null)}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={rejectLoading || !rejectReason.trim()}
              onClick={handleReject}
            >
              {rejectLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("confirmReject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
