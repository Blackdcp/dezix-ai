import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = req.nextUrl;

  // Date range defaults to last 7 days
  const endDateStr = searchParams.get("endDate");
  const startDateStr = searchParams.get("startDate");
  const modelId = searchParams.get("modelId") || "";

  const endDate = endDateStr ? new Date(endDateStr + "T23:59:59.999Z") : new Date();
  const startDate = startDateStr
    ? new Date(startDateStr + "T00:00:00.000Z")
    : (() => {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() - 6);
        d.setUTCHours(0, 0, 0, 0);
        return d;
      })();

  // Build where clause
  const where: Record<string, unknown> = {
    userId,
    createdAt: { gte: startDate, lte: endDate },
  };
  if (modelId) {
    where.modelId = modelId;
  }

  // 1. Summary aggregation
  const [successCount, errorCount, aggregate] = await Promise.all([
    db.usageLog.count({ where: { ...where, status: "success" } }),
    db.usageLog.count({ where: { ...where, status: "error" } }),
    db.usageLog.aggregate({
      where,
      _sum: {
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
        revenue: true,
      },
      _count: true,
    }),
  ]);

  const summary = {
    totalRequests: aggregate._count,
    totalTokens: aggregate._sum.totalTokens ?? 0,
    promptTokens: aggregate._sum.promptTokens ?? 0,
    completionTokens: aggregate._sum.completionTokens ?? 0,
    totalSpending: Number(aggregate._sum.revenue ?? 0),
    successCount,
    errorCount,
  };

  // 2. Daily trends - fetch logs and group in JS
  const trendLogs = await db.usageLog.findMany({
    where,
    select: {
      revenue: true,
      promptTokens: true,
      completionTokens: true,
      createdAt: true,
    },
  });

  // Build date range map
  const trendsMap = new Map<
    string,
    { requests: number; spending: number; tokens: number }
  >();
  const dayMs = 86400000;
  const startDay = new Date(startDate);
  startDay.setUTCHours(0, 0, 0, 0);
  const endDay = new Date(endDate);
  endDay.setUTCHours(0, 0, 0, 0);

  for (let d = new Date(startDay); d <= endDay; d = new Date(d.getTime() + dayMs)) {
    trendsMap.set(d.toISOString().slice(0, 10), {
      requests: 0,
      spending: 0,
      tokens: 0,
    });
  }

  for (const log of trendLogs) {
    const key = log.createdAt.toISOString().slice(0, 10);
    const entry = trendsMap.get(key);
    if (entry) {
      entry.requests += 1;
      entry.spending += Number(log.revenue);
      entry.tokens += log.promptTokens + log.completionTokens;
    }
  }

  const dailyTrends = Array.from(trendsMap.entries()).map(([date, data]) => ({
    date,
    requests: data.requests,
    spending: Math.round(data.spending * 1e6) / 1e6,
    tokens: data.tokens,
  }));

  // 3. Model breakdown - group by modelId (cuid PK)
  const modelLogs = await db.usageLog.findMany({
    where,
    select: {
      modelId: true,
      revenue: true,
      promptTokens: true,
      completionTokens: true,
    },
  });

  const modelMap = new Map<
    string,
    { requests: number; spending: number; tokens: number }
  >();
  for (const log of modelLogs) {
    const existing = modelMap.get(log.modelId) || {
      requests: 0,
      spending: 0,
      tokens: 0,
    };
    existing.requests += 1;
    existing.spending += Number(log.revenue);
    existing.tokens += log.promptTokens + log.completionTokens;
    modelMap.set(log.modelId, existing);
  }

  // Batch query Model table to get displayNames
  const modelIds = Array.from(modelMap.keys());
  const models = modelIds.length
    ? await db.model.findMany({
        where: { id: { in: modelIds } },
        select: { id: true, modelId: true, displayName: true },
      })
    : [];
  const modelNameMap = new Map(models.map((m) => [m.id, m.displayName]));
  const modelIdMap = new Map(models.map((m) => [m.id, m.modelId]));

  const modelBreakdown = Array.from(modelMap.entries())
    .map(([id, data]) => ({
      modelId: modelIdMap.get(id) || id,
      displayName: modelNameMap.get(id) || "未知模型",
      requests: data.requests,
      spending: Math.round(data.spending * 1e6) / 1e6,
      tokens: data.tokens,
    }))
    .sort((a, b) => b.requests - a.requests);

  // 4. Recent logs (last 50)
  const recentLogs = await db.usageLog.findMany({
    where,
    select: {
      id: true,
      modelId: true,
      promptTokens: true,
      completionTokens: true,
      totalTokens: true,
      revenue: true,
      duration: true,
      status: true,
      errorMessage: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Map model names for recent logs
  const logModelIds = [...new Set(recentLogs.map((l) => l.modelId))];
  const logModels = logModelIds.length
    ? await db.model.findMany({
        where: { id: { in: logModelIds } },
        select: { id: true, modelId: true, displayName: true },
      })
    : [];
  const logModelNameMap = new Map(logModels.map((m) => [m.id, m.displayName]));
  const logModelIdMap = new Map(logModels.map((m) => [m.id, m.modelId]));

  return NextResponse.json({
    summary,
    dailyTrends,
    modelBreakdown,
    recentLogs: recentLogs.map((l) => ({
      id: l.id,
      modelId: logModelIdMap.get(l.modelId) || l.modelId,
      displayName: logModelNameMap.get(l.modelId) || "未知模型",
      promptTokens: l.promptTokens,
      completionTokens: l.completionTokens,
      totalTokens: l.totalTokens,
      revenue: Number(l.revenue),
      duration: l.duration,
      status: l.status,
      errorMessage: l.errorMessage,
      createdAt: l.createdAt,
    })),
  });
}
