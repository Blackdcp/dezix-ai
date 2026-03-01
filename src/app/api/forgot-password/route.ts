import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validations";
import { checkIpRateLimit } from "@/lib/gateway/rate-limiter";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    // IP rate limit: 3 requests/minute
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const { allowed } = await checkIpRateLimit(ip, 3);
    if (!allowed) {
      return NextResponse.json(
        { error: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "INVALID_PARAMS";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { email } = parsed.data;

    // Detect locale from request
    const acceptLang = req.headers.get("accept-language") || "";
    const locale = acceptLang.includes("zh") ? "zh" : "en";

    // Always return success to prevent email enumeration
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });

    if (user && user.passwordHash) {
      // Delete existing tokens for this email
      await db.passwordResetToken.deleteMany({
        where: { email },
      });

      // Generate token (64-char hex)
      const rawToken = crypto.randomBytes(32).toString("hex");
      // Store hashed token
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      // Create token with 1-hour expiry
      await db.passwordResetToken.create({
        data: {
          email,
          token: hashedToken,
          expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      // Send email with raw token
      await sendPasswordResetEmail(email, rawToken, locale);
    }

    // Always return success (prevent email enumeration)
    return NextResponse.json({ message: "RESET_EMAIL_SENT" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
