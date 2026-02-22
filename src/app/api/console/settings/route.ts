import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateSettingsSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      createdAt: true,
      accounts: { select: { provider: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  const authMethods: string[] = [];
  if (user.passwordHash) authMethods.push("credentials");
  for (const a of user.accounts) {
    if (!authMethods.includes(a.provider)) authMethods.push(a.provider);
  }
  if (authMethods.length === 0) authMethods.push("credentials");

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    authMethods,
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "请求参数无效";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const updateData: { name?: string; email?: string } = {};

  if (parsed.data.name !== undefined) {
    updateData.name = parsed.data.name.trim();
  }

  if (parsed.data.email !== undefined) {
    // Check uniqueness
    const existing = await db.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ error: "该邮箱已被使用" }, { status: 409 });
    }
    updateData.email = parsed.data.email.trim();
  }

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return NextResponse.json(updated);
}
