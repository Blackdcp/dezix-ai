import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Get user balance
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { balance: true },
  });

  // Today's date range (UTC)
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  // Today's usage stats
  const todayStats = await db.usageLog.aggregate({
    where: {
      userId,
      createdAt: { gte: todayStart },
    },
    _sum: { revenue: true },
    _count: true,
  });

  // Active API keys count
  const activeKeys = await db.apiKey.count({
    where: { userId, isActive: true },
  });

  // 7-day trends
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setUTCHours(0, 0, 0, 0);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);

  const logs = await db.usageLog.findMany({
    where: {
      userId,
      createdAt: { gte: sevenDaysAgo },
    },
    select: {
      revenue: true,
      createdAt: true,
    },
  });

  // Group by date
  const trendsMap = new Map<string, { requests: number; spending: number }>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    trendsMap.set(key, { requests: 0, spending: 0 });
  }

  for (const log of logs) {
    const key = log.createdAt.toISOString().slice(0, 10);
    const entry = trendsMap.get(key);
    if (entry) {
      entry.requests += 1;
      entry.spending += Number(log.revenue);
    }
  }

  const trends = Array.from(trendsMap.entries()).map(([date, data]) => ({
    date,
    requests: data.requests,
    spending: Math.round(data.spending * 1e6) / 1e6,
  }));

  return NextResponse.json({
    balance: Number(user?.balance ?? 0),
    todaySpending: Number(todayStats._sum.revenue ?? 0),
    todayRequests: todayStats._count,
    activeKeys,
    trends,
  });
}
