"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
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
  const t = useTranslations("Referral");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchData = () => {
    setLoading(true);
    fetch("/api/console/referral")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => toast.error(t("loadFailed")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateCode = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/console/referral/generate", { method: "POST" });
      if (res.ok) {
        toast.success(t("codeGenerated"));
        fetchData();
      } else {
        toast.error(t("generateFailed"));
      }
    } catch {
      toast.error(t("generateFailed"));
    } finally {
      setGenerating(false);
    }
  };

  const referralLink = data?.referralCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${data.referralCode}`
    : "";

  const copyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.success(t("linkCopied"));
    }
  };

  const stats = [
    {
      title: t("referralUsers"),
      value: String(data?.referredCount ?? 0),
      desc: t("referralUsersDesc"),
      icon: Users,
    },
    {
      title: t("totalCommission"),
      value: `¥${(data?.totalEarnings ?? 0).toFixed(2)}`,
      desc: t("totalCommissionDesc"),
      icon: DollarSign,
    },
    {
      title: t("rewardCount"),
      value: String(data?.rewardCount ?? 0),
      desc: t("rewardCountDesc"),
      icon: Gift,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

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
          <CardTitle>{t("referralLink")}</CardTitle>
          <CardDescription>
            {t("referralLinkDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground">{tc("loading")}</div>
          ) : data?.referralCode ? (
            <div className="flex gap-2">
              <Input value={referralLink} readOnly className="font-mono" />
              <Button onClick={copyLink} variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                {t("copy")}
              </Button>
            </div>
          ) : (
            <Button onClick={generateCode} disabled={generating}>
              {generating ? t("generating") : t("generateCode")}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Rewards Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("rewardsTitle")}</CardTitle>
          <CardDescription>{t("rewardsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">{tc("loading")}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("time")}</TableHead>
                  <TableHead>{t("sourceUser")}</TableHead>
                  <TableHead className="text-right">{t("commission")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.rewards.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      {new Date(r.createdAt).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")}
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
                      {t("noRewards")}
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
