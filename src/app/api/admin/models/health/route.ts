import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const oneDayAgo = new Date();
  oneDayAgo.setUTCHours(oneDayAgo.getUTCHours() - 24);

  // Get per-model stats from last 24 hours
  const modelStats = await db.usageLog.groupBy({
    by: ["modelId"],
    where: { createdAt: { gte: oneDayAgo } },
    _count: true,
    _avg: { duration: true },
    _sum: { revenue: true },
  });

  // Get error counts per model
  const errorStats = await db.usageLog.groupBy({
    by: ["modelId"],
    where: { createdAt: { gte: oneDayAgo }, status: "error" },
    _count: true,
  });

  const errorMap = new Map(errorStats.map((e) => [e.modelId, e._count]));

  const health = modelStats.map((m) => {
    const errors = errorMap.get(m.modelId) ?? 0;
    const total = m._count;
    const errorRate = total > 0 ? Math.round((errors / total) * 10000) / 100 : 0;

    return {
      modelId: m.modelId,
      requests24h: total,
      errors24h: errors,
      errorRate,
      avgDuration: Math.round(Number(m._avg.duration ?? 0)),
      revenue24h: Math.round(Number(m._sum.revenue ?? 0) * 1e6) / 1e6,
    };
  });

  return NextResponse.json(health);
}
