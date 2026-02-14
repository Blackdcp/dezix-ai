"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, DollarSign, Gift, Copy } from "lucide-react";
import { toast } from "sonner";

interface RewardItem {
  id: string;
  fromUserEmail: string;
  amount: number;
  createdAt: string;
}

interface ReferralData {
  referralCode: string | null;
  referredCount: number;
  totalEarnings: number;
  rewardCount: number;
  rewards: RewardItem[];
}

export default function ReferralPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchData = () => {
    setLoading(true);
    fetch("/api/console/referral")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateCode = async () => {
    setGenerating(true);
    const res = await fetch("/api/console/referral/generate", { method: "POST" });
    if (res.ok) {
      toast.success("推荐码已生成");
      fetchData();
    } else {
      toast.error("生成失败");
    }
    setGenerating(false);
  };

  const referralLink = data?.referralCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${data.referralCode}`
    : "";

  const copyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.success("推荐链接已复制");
    }
  };

  const stats = [
    {
      title: "推荐用户数",
      value: String(data?.referredCount ?? 0),
      desc: "通过你的链接注册的用户",
      icon: Users,
    },
    {
      title: "总佣金收入",
      value: `¥${(data?.totalEarnings ?? 0).toFixed(2)}`,
      desc: "累计推荐返佣金额",
      icon: DollarSign,
    },
    {
      title: "返佣次数",
      value: String(data?.rewardCount ?? 0),
      desc: "累计获得返佣次数",
      icon: Gift,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">推荐返佣</h1>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
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

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle>推荐链接</CardTitle>
          <CardDescription>
            分享你的推荐链接，被推荐用户每次充值你将获得 10% 返佣
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground">加载中...</div>
          ) : data?.referralCode ? (
            <div className="flex gap-2">
              <Input value={referralLink} readOnly className="font-mono" />
              <Button onClick={copyLink} variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                复制
              </Button>
            </div>
          ) : (
            <Button onClick={generateCode} disabled={generating}>
              {generating ? "生成中..." : "生成推荐码"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Rewards Table */}
      <Card>
        <CardHeader>
          <CardTitle>返佣记录</CardTitle>
          <CardDescription>最近 50 条返佣记录</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">加载中...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>来源用户</TableHead>
                  <TableHead className="text-right">佣金金额</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.rewards.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      {new Date(r.createdAt).toLocaleString("zh-CN")}
                    </TableCell>
                    <TableCell>{r.fromUserEmail}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      +¥{r.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.rewards || data.rewards.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      暂无返佣记录
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
