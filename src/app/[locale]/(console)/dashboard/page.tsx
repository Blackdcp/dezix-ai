"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard, Activity, Key, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TrendItem {
  date: string;
  requests: number;
  spending: number;
}

interface DashboardData {
  balance: number;
  todaySpending: number;
  todayRequests: number;
  activeKeys: number;
  trends: TrendItem[];
}

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const tc = useTranslations("Common");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/console/dashboard")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      title: t("balance"),
      value: `¥${(data?.balance ?? 0).toFixed(2)}`,
      desc: t("balanceDesc"),
      icon: CreditCard,
    },
    {
      title: t("todaySpending"),
      value: `¥${(data?.todaySpending ?? 0).toFixed(4)}`,
      desc: t("todaySpendingDesc"),
      icon: TrendingUp,
    },
    {
      title: t("requests"),
      value: String(data?.todayRequests ?? 0),
      desc: t("requestsDesc"),
      icon: Activity,
    },
    {
      title: t("apiKeys"),
      value: String(data?.activeKeys ?? 0),
      desc: t("apiKeysDesc"),
      icon: Key,
    },
  ];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

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

      {/* 7-Day Trends */}
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
                data={data?.trends ?? []}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
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
                  fill="url(#colorRequests)"
                  strokeWidth={2}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="spending"
                  stroke="hsl(142, 71%, 45%)"
                  fill="url(#colorSpending)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle>{t("quickStart")}</CardTitle>
          <CardDescription>{t("quickStartDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>{t("step1")}</p>
          <p>{t("step2")}</p>
          <p>{t("step3")}</p>
          <p>{t("step4")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
