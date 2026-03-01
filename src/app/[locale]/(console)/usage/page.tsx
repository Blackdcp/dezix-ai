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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  CreditCard,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Summary {
  totalRequests: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalSpending: number;
  successCount: number;
  errorCount: number;
}

interface DailyTrend {
  date: string;
  requests: number;
  spending: number;
  tokens: number;
}

interface ModelBreakdown {
  modelId: string;
  displayName: string;
  requests: number;
  spending: number;
  tokens: number;
}

interface LogItem {
  id: string;
  modelId: string;
  displayName: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  revenue: number;
  duration: number;
  status: string;
  errorMessage: string | null;
  createdAt: string;
}

interface ModelOption {
  id: string;
  modelId: string;
  displayName: string;
}

function getDateRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export default function UsagePage() {
  const t = useTranslations("Usage");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [dailyTrends, setDailyTrends] = useState<DailyTrend[]>([]);
  const [modelBreakdown, setModelBreakdown] = useState<ModelBreakdown[]>([]);
  const [recentLogs, setRecentLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [preset, setPreset] = useState("7");
  const [startDate, setStartDate] = useState(() => getDateRange(7).startDate);
  const [endDate, setEndDate] = useState(() => getDateRange(7).endDate);
  const [modelFilter, setModelFilter] = useState("all");
  const [modelOptions, setModelOptions] = useState<ModelOption[]>([]);

  // Load model options
  useEffect(() => {
    fetch("/api/console/models")
      .then((r) => r.json())
      .then((data) => {
        setModelOptions(
          data.models.map((m: { id: string; modelId: string; displayName: string }) => ({
            id: m.id,
            modelId: m.modelId,
            displayName: m.displayName,
          }))
        );
      })
      .catch(() => toast.error(t("loadFailed")));
  }, []);

  const fetchUsage = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("startDate", startDate);
    params.set("endDate", endDate);
    if (modelFilter && modelFilter !== "all") params.set("modelId", modelFilter);

    try {
      const res = await fetch(`/api/console/usage?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setDailyTrends(data.dailyTrends);
        setModelBreakdown(data.modelBreakdown);
        setRecentLogs(data.recentLogs);
      }
    } catch {
      toast.error(t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, modelFilter]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const handlePreset = (days: string) => {
    setPreset(days);
    if (days !== "custom") {
      const range = getDateRange(Number(days));
      setStartDate(range.startDate);
      setEndDate(range.endDate);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const stats = [
    {
      title: t("totalRequests"),
      value: String(summary?.totalRequests ?? 0),
      desc: t("successCount", { success: summary?.successCount ?? 0, error: summary?.errorCount ?? 0 }),
      icon: Activity,
    },
    {
      title: t("totalSpending"),
      value: `¥${(summary?.totalSpending ?? 0).toFixed(4)}`,
      desc: t("periodSpending"),
      icon: CreditCard,
    },
    {
      title: t("inputTokens"),
      value: (summary?.promptTokens ?? 0).toLocaleString(),
      desc: t("promptTokensDesc"),
      icon: ArrowDownToLine,
    },
    {
      title: t("outputTokens"),
      value: (summary?.completionTokens ?? 0).toLocaleString(),
      desc: t("completionTokensDesc"),
      icon: ArrowUpFromLine,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          {[
            { label: t("days7"), value: "7" },
            { label: t("days30"), value: "30" },
            { label: t("days90"), value: "90" },
          ].map((p) => (
            <Button
              key={p.value}
              variant={preset === p.value ? "default" : "outline"}
              size="sm"
              onClick={() => handlePreset(p.value)}
            >
              {p.label}
            </Button>
          ))}
          <Button
            variant={preset === "custom" ? "default" : "outline"}
            size="sm"
            onClick={() => handlePreset("custom")}
          >
            {t("custom")}
          </Button>
        </div>
        {preset === "custom" && (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-[150px]"
            />
            <span className="text-muted-foreground">{t("to")}</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-[150px]"
            />
          </div>
        )}
        <Select value={modelFilter} onValueChange={setModelFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={t("modelFilter")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allModels")}</SelectItem>
            {modelOptions.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : s.value}
              </div>
              <CardDescription>{s.desc}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t("trendsTitle")}</CardTitle>
          <CardDescription>{t("trendsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              {tc("loading")}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={dailyTrends}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient
                    id="colorUsageRequests"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(221, 83%, 53%)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(221, 83%, 53%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient
                    id="colorUsageSpending"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(142, 71%, 45%)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(142, 71%, 45%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  yAxisId="left"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v: number) => `¥${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--popover-foreground))",
                  }}
                  labelFormatter={(label) => formatDate(String(label))}
                  formatter={(value, name) => {
                    const v = Number(value);
                    return [
                      name === "requests" ? v : `¥${v.toFixed(4)}`,
                      name === "requests" ? t("requestCount") : t("spending"),
                    ];
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="requests"
                  stroke="hsl(221, 83%, 53%)"
                  fill="url(#colorUsageRequests)"
                  strokeWidth={2}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="spending"
                  stroke="hsl(142, 71%, 45%)"
                  fill="url(#colorUsageSpending)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Model Breakdown */}
      {modelBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("modelBreakdown")}</CardTitle>
            <CardDescription>{t("modelBreakdownDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(200, modelBreakdown.length * 40)}>
              <BarChart
                data={modelBreakdown}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  type="number"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="displayName"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  width={95}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--popover-foreground))",
                  }}
                  formatter={(value, name) => {
                    const v = Number(value);
                    if (name === "requests") return [v, t("requestCount")];
                    if (name === "spending") return [`¥${v.toFixed(4)}`, t("spending")];
                    return [v.toLocaleString(), t("token")];
                  }}
                />
                <Bar dataKey="requests" fill="hsl(221, 83%, 53%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("logsTitle")}</CardTitle>
          <CardDescription>{t("logsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              {tc("loading")}
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {t("noLogs")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("model")}</TableHead>
                    <TableHead className="text-right">{t("inputToken")}</TableHead>
                    <TableHead className="text-right">{t("outputToken")}</TableHead>
                    <TableHead className="text-right">{t("cost")}</TableHead>
                    <TableHead>{t("statusCol")}</TableHead>
                    <TableHead className="text-right">{t("duration")}</TableHead>
                    <TableHead>{t("time")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {log.displayName}
                        <div className="text-xs text-muted-foreground">
                          {log.modelId}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {log.promptTokens.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {log.completionTokens.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        ¥{log.revenue.toFixed(6)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.status === "success" ? "default" : "destructive"
                          }
                        >
                          {log.status === "success" ? t("success") : t("failed")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {log.duration}ms
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
