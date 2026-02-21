import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { adminLogsQuerySchema } from "@/lib/validations";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const url = new URL(req.url);
  const parsed = adminLogsQuerySchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
    userId: url.searchParams.get("userId") ?? undefined,
    modelId: url.searchParams.get("modelId") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    dateFrom: url.searchParams.get("dateFrom") ?? undefined,
    dateTo: url.searchParams.get("dateTo") ?? undefined,
  });
  const { page, pageSize, userId, modelId, status, dateFrom, dateTo } = parsed.success
    ? parsed.data
    : { page: 1, pageSize: 20, userId: "", modelId: "", status: "", dateFrom: "", dateTo: "" };

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
