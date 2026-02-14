import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.oldPassword || !body.newPassword) {
    return NextResponse.json(
      { error: "请提供当前密码和新密码" },
      { status: 400 }
    );
  }

  if (body.newPassword.length < 8) {
    return NextResponse.json(
      { error: "新密码至少 8 位" },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user || !user.passwordHash) {
    return NextResponse.json(
      { error: "用户不存在或未设置密码" },
      { status: 400 }
    );
  }

  const isValid = await bcrypt.compare(body.oldPassword, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "当前密码错误" }, { status: 400 });
  }

  const newHash = await bcrypt.hash(body.newPassword, 12);

  await db.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash },
  });

  return NextResponse.json({ success: true });
}
