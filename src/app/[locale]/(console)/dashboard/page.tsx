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
import { toast } from "sonner";
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

const statColors = [
  { icon: "text-primary", bg: "bg-primary/10" },
  { icon: "text-[#D97706]", bg: "bg-[#fef0ef]" },
  { icon: "text-[#16A34A]", bg: "bg-[#ecfdf3]" },
  { icon: "text-[#f59e0b]", bg: "bg-[#fef9ec]" },
];

function StatSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="h-4 w-20 animate-pulse rounded bg-[#F5F3EF]" />
        <div className="h-8 w-8 animate-pulse rounded-xl bg-[#F5F3EF]" />
      </CardHeader>
      <CardContent>
        <div className="h-7 w-24 animate-pulse rounded bg-[#F5F3EF]" />
        <div className="mt-2 h-3 w-32 animate-pulse rounded bg-[#F5F3EF]" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/console/dashboard")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => toast.error(t("loadFailed")))
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
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : stats.map((s, i) => (
              <Card key={s.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${statColors[i].bg}`}>
                    <s.icon className={`h-4 w-4 ${statColors[i].icon}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{s.value}</div>
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
            <div className="flex h-[300px] items-center justify-center">
              <div className="h-full w-full animate-pulse rounded-xl bg-[#F5F3EF]" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={data?.trends ?? []}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F26522" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F26522" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  className="text-xs"
                  tick={{ fill: "#A8A29E" }}
                />
                <YAxis
                  yAxisId="left"
                  className="text-xs"
                  tick={{ fill: "#A8A29E" }}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  className="text-xs"
                  tick={{ fill: "#A8A29E" }}
                  tickFormatter={(v: number) => `¥${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #E7E5E0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    color: "#1C1917",
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
                  stroke="#F26522"
                  fill="url(#colorRequests)"
                  strokeWidth={2}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="spending"
                  stroke="#16A34A"
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
