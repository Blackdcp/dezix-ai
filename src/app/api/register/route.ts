import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import { checkIpRateLimit } from "@/lib/gateway/rate-limiter";

export async function POST(req: Request) {
  try {
    // IP rate limit: 5 requests/minute
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const { allowed } = await checkIpRateLimit(ip, 5);
    if (!allowed) {
      return NextResponse.json(
        { error: "请求过于频繁，请稍后再试" },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "请求参数无效";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { name, email, password, referralCode } = parsed.data;

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
