import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { adminUsersQuerySchema } from "@/lib/validations";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const url = new URL(req.url);
  const parsed = adminUsersQuerySchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
    role: url.searchParams.get("role") ?? undefined,
  });
  const { page, pageSize, search, role } = parsed.success
    ? parsed.data
    : { page: 1, pageSize: 20, search: "", role: undefined as string | undefined };

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
        passwordHash: true,
        createdAt: true,
        accounts: { select: { provider: true } },
        _count: { select: { apiKeys: true, usageLogs: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.user.count({ where }),
  ]);

  return NextResponse.json({
    users: users.map((u) => {
      const authMethods: string[] = [];
      if (u.passwordHash) authMethods.push("credentials");
      for (const a of u.accounts) {
        if (!authMethods.includes(a.provider)) authMethods.push(a.provider);
      }
      if (authMethods.length === 0) authMethods.push("credentials");
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        balance: Number(u.balance),
        referralCode: u.referralCode,
        createdAt: u.createdAt,
        authMethods,
        _count: u._count,
      };
    }),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
