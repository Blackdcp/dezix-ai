import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get("pageSize") || "20")));
  const userId = url.searchParams.get("userId") || "";
  const modelId = url.searchParams.get("modelId") || "";
  const status = url.searchParams.get("status") || "";
  const dateFrom = url.searchParams.get("dateFrom") || "";
  const dateTo = url.searchParams.get("dateTo") || "";

  const where: Record<string, unknown> = {};

  if (userId) where.userId = userId;
  if (modelId) where.modelId = modelId;
  if (status) where.status = status;

  if (dateFrom || dateTo) {
    const createdAt: Record<string, Date> = {};
    if (dateFrom) createdAt.gte = new Date(dateFrom + "T00:00:00Z");
    if (dateTo) {
      const end = new Date(dateTo + "T00:00:00Z");
      end.setUTCDate(end.getUTCDate() + 1);
      createdAt.lt = end;
    }
    where.createdAt = createdAt;
  }

  const [logs, total] = await Promise.all([
    db.usageLog.findMany({
      where,
      select: {
        id: true,
        userId: true,
        modelId: true,
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
        cost: true,
        revenue: true,
        duration: true,
        status: true,
        errorMessage: true,
        requestIp: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        model: { select: { displayName: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.usageLog.count({ where }),
  ]);

  return NextResponse.json({
    logs: logs.map((l) => ({
      ...l,
      cost: Number(l.cost),
      revenue: Number(l.revenue),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
