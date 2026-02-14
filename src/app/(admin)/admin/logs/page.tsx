"use client";

import { useEffect, useState, useCallback } from "react";
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
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">请求日志</h1>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="用户 ID"
              value={userId}
              onChange={(e) => { setUserId(e.target.value); setPage(1); }}
              className="w-48"
            />
            <Input
              placeholder="模型 ID (如 gpt-4o)"
              value={modelId}
              onChange={(e) => { setModelId(e.target.value); setPage(1); }}
              className="w-48"
            />
            <Select
              value={status || "ALL"}
              onValueChange={(v) => { setStatus(v === "ALL" ? "" : v); setPage(1); }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">全部状态</SelectItem>
                <SelectItem value="success">成功</SelectItem>
                <SelectItem value="error">失败</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="w-40"
            />
            <span className="self-center text-muted-foreground">至</span>
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
            <CardTitle>日志列表</CardTitle>
            <span className="text-sm text-muted-foreground">共 {total} 条</span>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">加载中...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>用户</TableHead>
                    <TableHead>模型</TableHead>
                    <TableHead>Token(入/出)</TableHead>
                    <TableHead className="text-right">成本</TableHead>
                    <TableHead className="text-right">收入</TableHead>
                    <TableHead>耗时</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {new Date(l.createdAt).toLocaleString("zh-CN")}
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
                          {l.status === "success" ? "成功" : "失败"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        暂无日志
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 pt-4">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    上一页
                  </Button>
                  <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                    下一页
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
