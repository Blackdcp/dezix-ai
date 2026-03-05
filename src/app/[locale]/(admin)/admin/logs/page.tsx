"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Activity, DollarSign, Timer, AlertTriangle, Hash } from "lucide-react";

interface LogItem {
  id: string;
  userId: string;
  modelId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  revenue: number;
  duration: number;
  status: string;
  errorMessage: string | null;
  requestIp: string | null;
  createdAt: string;
  user: { name: string | null; email: string };
  model: { displayName: string };
}

interface LogStats {
  totalRevenue: number;
  totalCost: number;
  totalTokens: number;
  avgDuration: number;
  errorCount: number;
}

export default function AdminLogsPage() {
  const t = useTranslations("AdminLogs");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<LogStats | null>(null);

  // Filters
  const [userId, setUserId] = useState("");
  const [modelId, setModelId] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchLogs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (userId) params.set("userId", userId);
    if (modelId) params.set("modelId", modelId);
    if (status) params.set("status", status);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    fetch(`/api/admin/logs?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setLogs(d.logs || []);
        setTotalPages(d.totalPages || 1);
        setTotal(d.total || 0);
        if (d.stats) setStats(d.stats);
      })
      .catch(() => toast.error(t("loadFailed")))
      .finally(() => setLoading(false));
  }, [page, userId, modelId, status, dateFrom, dateTo, t]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const statCards = stats ? [
    { icon: Activity, label: t("statsRequests"), value: String(total) },
    { icon: DollarSign, label: t("statsRevenue"), value: `¥${stats.totalRevenue.toFixed(4)}` },
    { icon: DollarSign, label: t("statsCost"), value: `¥${stats.totalCost.toFixed(4)}` },
    { icon: Hash, label: t("statsTokens"), value: stats.totalTokens.toLocaleString() },
    { icon: Timer, label: t("statsAvgLatency"), value: `${stats.avgDuration}ms` },
    { icon: AlertTriangle, label: t("statsErrors"), value: String(stats.errorCount) },
  ] : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      {/* Stats Summary */}
      {stats && !loading && (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {statCards.map((s) => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                  <p className="text-sm font-semibold truncate">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("filters")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder={t("userIdPlaceholder")}
              value={userId}
              onChange={(e) => { setUserId(e.target.value); setPage(1); }}
              className="w-48"
            />
            <Input
              placeholder={t("modelIdPlaceholder")}
              value={modelId}
              onChange={(e) => { setModelId(e.target.value); setPage(1); }}
              className="w-48"
            />
            <Select
              value={status || "ALL"}
              onValueChange={(v) => { setStatus(v === "ALL" ? "" : v); setPage(1); }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t("allStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("allStatus")}</SelectItem>
                <SelectItem value="success">{t("success")}</SelectItem>
                <SelectItem value="error">{t("error")}</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="w-40"
            />
            <span className="self-center text-muted-foreground">{t("to")}</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="w-40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("logList")}</CardTitle>
            <span className="text-sm text-muted-foreground">{t("totalCount", { count: total })}</span>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">{tc("loading")}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("time")}</TableHead>
                      <TableHead>{t("user")}</TableHead>
                      <TableHead>{t("model")}</TableHead>
                      <TableHead>{t("tokens")}</TableHead>
                      <TableHead className="text-right">{t("cost")}</TableHead>
                      <TableHead className="text-right">{t("revenue")}</TableHead>
                      <TableHead>{t("duration")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead>{t("ip")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {new Date(l.createdAt).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")}
                        </TableCell>
                        <TableCell className="text-sm">
                          {l.user.name || l.user.email}
                        </TableCell>
                        <TableCell className="text-sm">{l.model.displayName}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {l.promptTokens} / {l.completionTokens}
                        </TableCell>
                        <TableCell className="text-right text-sm">¥{l.cost.toFixed(6)}</TableCell>
                        <TableCell className="text-right text-sm">¥{l.revenue.toFixed(6)}</TableCell>
                        <TableCell className="text-sm">{l.duration}ms</TableCell>
                        <TableCell>
                          {l.status === "error" && l.errorMessage ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="destructive" className="cursor-help">
                                    {t("error")}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="max-w-xs">
                                  <p className="text-xs break-all">{l.errorMessage}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <Badge variant={l.status === "success" ? "default" : "destructive"}>
                              {l.status === "success" ? t("success") : t("error")}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {l.requestIp || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {logs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          {t("noLogs")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 pt-4">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    {t("prevPage")}
                  </Button>
                  <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                    {t("nextPage")}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
