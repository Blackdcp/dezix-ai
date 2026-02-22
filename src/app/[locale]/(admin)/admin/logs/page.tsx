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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function AdminLogsPage() {
  const t = useTranslations("AdminLogs");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

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
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, userId, modelId, status, dateFrom, dateTo]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

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
                        <Badge variant={l.status === "success" ? "default" : "destructive"}>
                          {l.status === "success" ? t("success") : t("error")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        {t("noLogs")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

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
