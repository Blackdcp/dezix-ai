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
import { Users, TrendingUp, DollarSign, Activity, BarChart3, Zap } from "lucide-react";
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
  revenue: number;
  cost: number;
  requests: number;
}

interface DashboardData {
  totalUsers: number;
  todayUsers: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalRequests: number;
  todayRevenue: number;
  todayCost: number;
  todayRequests: number;
  trends: TrendItem[];
}

export default function AdminDashboardPage() {
  const t = useTranslations("AdminDashboard");
  const tc = useTranslations("Common");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      title: t("totalUsers"),
      value: String(data?.totalUsers ?? 0),
      desc: t("todayNewUsers", { count: data?.todayUsers ?? 0 }),
      icon: Users,
    },
    {
      title: t("totalRevenue"),
      value: `¥${(data?.totalRevenue ?? 0).toFixed(4)}`,
      desc: t("todayRevenue", { amount: (data?.todayRevenue ?? 0).toFixed(4) }),
      icon: TrendingUp,
    },
    {
      title: t("totalCost"),
      value: `¥${(data?.totalCost ?? 0).toFixed(4)}`,
      desc: t("todayCost", { amount: (data?.todayCost ?? 0).toFixed(4) }),
      icon: DollarSign,
    },
    {
      title: t("totalProfit"),
      value: `¥${(data?.totalProfit ?? 0).toFixed(4)}`,
      desc: t("profitDesc"),
      icon: BarChart3,
    },
    {
      title: t("totalRequests"),
      value: String(data?.totalRequests ?? 0),
      desc: t("todayRequests", { count: data?.todayRequests ?? 0 }),
      icon: Activity,
    },
    {
      title: t("todayRequestsTitle"),
      value: String(data?.todayRequests ?? 0),
      desc: t("todayRequestsDesc"),
      icon: Zap,
    },
  ];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorReqs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
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
                  tickFormatter={(v: number) => `¥${v}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  allowDecimals={false}
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
                    if (name === "requests") return [v, t("requestCount")];
                    if (name === "revenue") return [`¥${v.toFixed(4)}`, t("revenue")];
                    return [`¥${v.toFixed(4)}`, t("cost")];
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(142, 71%, 45%)"
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="cost"
                  stroke="hsl(0, 84%, 60%)"
                  fill="url(#colorCost)"
                  strokeWidth={2}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="requests"
                  stroke="hsl(221, 83%, 53%)"
                  fill="url(#colorReqs)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
