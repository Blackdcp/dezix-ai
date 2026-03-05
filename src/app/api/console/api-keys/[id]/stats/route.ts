import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify the key belongs to the user
  const apiKey = await db.apiKey.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!apiKey) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setUTCHours(0, 0, 0, 0);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);

  const [agg, errorCount, recentLogs, dailyRaw] = await Promise.all([
    db.usageLog.aggregate({
      where: { apiKeyId: id },
      _sum: { revenue: true, totalTokens: true },
      _avg: { duration: true },
      _count: true,
    }),
    db.usageLog.count({
      where: { apiKeyId: id, status: "error" },
    }),
    db.usageLog.findMany({
      where: { apiKeyId: id },
      select: {
        modelId: true,
        totalTokens: true,
        revenue: true,
        duration: true,
        status: true,
        createdAt: true,
        model: { select: { displayName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.usageLog.findMany({
      where: { apiKeyId: id, createdAt: { gte: sevenDaysAgo } },
      select: { revenue: true, createdAt: true },
    }),
  ]);

  // Build 7-day daily breakdown
  const dailyMap = new Map<string, { requests: number; revenue: number }>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setUTCDate(d.getUTCDate() + i);
    dailyMap.set(d.toISOString().slice(0, 10), { requests: 0, revenue: 0 });
  }
  for (const log of dailyRaw) {
    const key = log.createdAt.toISOString().slice(0, 10);
    const entry = dailyMap.get(key);
    if (entry) {
      entry.requests += 1;
      entry.revenue += Number(log.revenue);
    }
  }
  const daily = Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    requests: data.requests,
    revenue: Math.round(data.revenue * 1e6) / 1e6,
  }));

  return NextResponse.json({
    totalRequests: agg._count,
    totalRevenue: Math.round(Number(agg._sum.revenue ?? 0) * 1e6) / 1e6,
    totalTokens: Number(agg._sum.totalTokens ?? 0),
    avgDuration: Math.round(Number(agg._avg.duration ?? 0)),
    errorCount,
    daily,
    recentLogs: recentLogs.map((l) => ({
      ...l,
      revenue: Number(l.revenue),
    })),
  });
}
