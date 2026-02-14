import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get("pageSize") || "20")));
  const search = url.searchParams.get("search") || "";
  const role = url.searchParams.get("role") || "";

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role === "ADMIN" || role === "USER") {
    where.role = role;
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balance: true,
        referralCode: true,
        createdAt: true,
        _count: { select: { apiKeys: true, usageLogs: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.user.count({ where }),
  ]);

  return NextResponse.json({
    users: users.map((u) => ({
      ...u,
      balance: Number(u.balance),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
