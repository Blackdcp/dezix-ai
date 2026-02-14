import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password, referralCode } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "请填写所有字段" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "密码至少需要 8 位" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 409 }
      );
    }

    // Validate referral code if provided
    let referredBy: string | undefined;
    if (referralCode) {
      const referrer = await db.user.findFirst({
        where: { referralCode },
        select: { id: true },
      });
      if (referrer) {
        referredBy = referrer.id;
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newReferralCode = crypto.randomBytes(4).toString("hex");

    await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        referralCode: newReferralCode,
        referredBy,
      },
    });

    return NextResponse.json({ message: "注册成功" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
