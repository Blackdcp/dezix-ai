import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import { checkIpRateLimit } from "@/lib/gateway/rate-limiter";

/** Default welcome bonus (¥) — can be overridden via SystemConfig key "welcome_bonus" */
const DEFAULT_WELCOME_BONUS = "1";

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
        { error: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "INVALID_PARAMS";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { name, email, password, referralCode } = parsed.data;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "EMAIL_ALREADY_EXISTS" },
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

    // Read configurable welcome bonus
    const cfg = await db.systemConfig.findUnique({ where: { key: "welcome_bonus" } });
    const bonusAmount = new Prisma.Decimal(cfg?.value || DEFAULT_WELCOME_BONUS);

    // Create user + grant welcome bonus in a single transaction
    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          balance: bonusAmount,
          referralCode: newReferralCode,
          referredBy,
        },
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "BONUS",
          amount: bonusAmount,
          balance: bonusAmount,
          description: "Welcome bonus",
        },
      });
    });

    return NextResponse.json({ message: "REGISTER_SUCCESS" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
