import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  // Total users
  const totalUsers = await db.user.count();

  // Today's new users
  const todayUsers = await db.user.count({
    where: { createdAt: { gte: todayStart } },
  });

  // Total revenue, cost, profit from usage logs
  const totalStats = await db.usageLog.aggregate({
    _sum: { revenue: true, cost: true },
    _count: true,
  });

  const totalRevenue = Number(totalStats._sum.revenue ?? 0);
  const totalCost = Number(totalStats._sum.cost ?? 0);
  const totalProfit = totalRevenue - totalCost;
  const totalRequests = totalStats._count;

  // Today's stats
  const todayStats = await db.usageLog.aggregate({
    where: { createdAt: { gte: todayStart } },
    _sum: { revenue: true, cost: true },
    _count: true,
  });

  const todayRevenue = Number(todayStats._sum.revenue ?? 0);
  const todayCost = Number(todayStats._sum.cost ?? 0);
  const todayRequests = todayStats._count;

  // Error rates
  const totalErrors = await db.usageLog.count({
    where: { status: "error" },
  });
  const todayErrors = await db.usageLog.count({
    where: { status: "error", createdAt: { gte: todayStart } },
  });
  const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0;
  const todayErrorRate = todayRequests > 0 ? todayErrors / todayRequests : 0;

  // Top 5 models by request count (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setUTCHours(0, 0, 0, 0);
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 29);

  const topModelsRaw = await db.usageLog.groupBy({
    by: ["modelId"],
    where: { createdAt: { gte: thirtyDaysAgo } },
    _count: true,
    _sum: { revenue: true },
    orderBy: { _count: { modelId: "desc" } },
    take: 5,
  });

  const topModelIds = topModelsRaw.map((m) => m.modelId);
  const modelNames = await db.model.findMany({
    where: { id: { in: topModelIds } },
    select: { id: true, displayName: true },
  });
  const nameMap = new Map(modelNames.map((m) => [m.id, m.displayName]));

  const topModels = topModelsRaw.map((m) => ({
    modelId: m.modelId,
    displayName: nameMap.get(m.modelId) ?? m.modelId,
    requests: m._count,
    revenue: Math.round(Number(m._sum.revenue ?? 0) * 1e6) / 1e6,
  }));

  // 30-day trends

  const logs = await db.usageLog.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { revenue: true, cost: true, createdAt: true },
  });

  const trendsMap = new Map<string, { revenue: number; cost: number; requests: number }>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    trendsMap.set(key, { revenue: 0, cost: 0, requests: 0 });
  }

  for (const log of logs) {
    const key = log.createdAt.toISOString().slice(0, 10);
    const entry = trendsMap.get(key);
    if (entry) {
      entry.revenue += Number(log.revenue);
      entry.cost += Number(log.cost);
      entry.requests += 1;
    }
  }

  const trends = Array.from(trendsMap.entries()).map(([date, data]) => ({
    date,
    revenue: Math.round(data.revenue * 1e6) / 1e6,
    cost: Math.round(data.cost * 1e6) / 1e6,
    requests: data.requests,
  }));

  return NextResponse.json({
    totalUsers,
    todayUsers,
    totalRevenue: Math.round(totalRevenue * 1e6) / 1e6,
    totalCost: Math.round(totalCost * 1e6) / 1e6,
    totalProfit: Math.round(totalProfit * 1e6) / 1e6,
    totalRequests,
    todayRevenue: Math.round(todayRevenue * 1e6) / 1e6,
    todayCost: Math.round(todayCost * 1e6) / 1e6,
    todayRequests,
    errorRate: Math.round(errorRate * 10000) / 100,
    todayErrorRate: Math.round(todayErrorRate * 10000) / 100,
    topModels,
    trends,
  });
}
