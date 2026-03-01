import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  return new Resend(apiKey);
}

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Dezix AI";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://dezix-ai.vercel.app";

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  locale: string = "zh"
) {
  const resetLink = `${APP_URL}/${locale === "zh" ? "" : locale + "/"}reset-password?token=${token}`;

  const isZh = locale === "zh";

  const subject = isZh
    ? `${APP_NAME} — 重置密码`
    : `${APP_NAME} — Reset Your Password`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F9F8F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9F8F6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;border:1px solid #E7E5E4;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#0070F3,#00B4D8);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">${APP_NAME}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#1C1917;">
                ${isZh ? "重置密码" : "Reset Your Password"}
              </h2>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#57534E;">
                ${isZh
                  ? "我们收到了重置你账户密码的请求。点击下方按钮设置新密码。此链接将在 1 小时后过期。"
                  : "We received a request to reset your account password. Click the button below to set a new password. This link expires in 1 hour."}
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="${resetLink}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#0070F3,#00B4D8);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:999px;">
                      ${isZh ? "重置密码" : "Reset Password"}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;color:#A8A29E;">
                ${isZh ? "如果按钮无法点击，请复制以下链接到浏览器：" : "If the button doesn't work, copy this link to your browser:"}
              </p>
              <p style="margin:0 0 24px;font-size:13px;color:#0070F3;word-break:break-all;">
                ${resetLink}
              </p>
              <hr style="border:none;border-top:1px solid #E7E5E4;margin:24px 0;" />
              <p style="margin:0;font-size:13px;color:#A8A29E;">
                ${isZh
                  ? "如果你没有请求重置密码，请忽略此邮件。"
                  : "If you didn't request a password reset, please ignore this email."}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;background-color:#FAFAF9;text-align:center;">
              <p style="margin:0;font-size:12px;color:#A8A29E;">
                © 2026 ${APP_NAME}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const { error } = await getResend().emails.send({
    from: `${APP_NAME} <onboarding@resend.dev>`,
    to: email,
    subject,
    html,
  });

  if (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error("EMAIL_SEND_FAILED");
  }
}
