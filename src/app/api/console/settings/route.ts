import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "请求体无效" }, { status: 400 });
  }

  const updateData: { name?: string; email?: string } = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json({ error: "姓名不能为空" }, { status: 400 });
    }
    updateData.name = body.name.trim();
  }

  if (body.email !== undefined) {
    if (typeof body.email !== "string" || !body.email.includes("@")) {
      return NextResponse.json({ error: "邮箱格式无效" }, { status: 400 });
    }
    // Check uniqueness
    const existing = await db.user.findUnique({
      where: { email: body.email },
      select: { id: true },
    });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ error: "该邮箱已被使用" }, { status: 409 });
    }
    updateData.email = body.email.trim();
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "没有需要更新的字段" }, { status: 400 });
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
