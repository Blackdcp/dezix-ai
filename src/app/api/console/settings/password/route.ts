import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { changePasswordSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "请求参数无效";
    return NextResponse.json({ error: msg }, { status: 400 });
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

  const isValid = await bcrypt.compare(parsed.data.oldPassword, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "当前密码错误" }, { status: 400 });
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);

  await db.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash },
  });

  return NextResponse.json({ success: true });
}
