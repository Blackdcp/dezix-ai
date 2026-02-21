import { z } from "zod";
import { nameSchema, emailSchema, passwordSchema } from "./common";

// POST /api/console/api-keys
export const createApiKeySchema = z.object({
  name: z.string().min(1, "name is required"),
  expiresAt: z.string().datetime().optional().nullable(),
  totalQuota: z.number().positive().optional().nullable(),
  modelWhitelist: z.array(z.string()).optional(),
  rateLimit: z.number().int().positive().optional().nullable(),
});

// PATCH /api/console/api-keys/[id]
export const updateApiKeySchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  totalQuota: z.number().positive().optional().nullable(),
  modelWhitelist: z.array(z.string()).optional(),
  rateLimit: z.number().int().positive().optional().nullable(),
});

// POST /api/console/billing/topup
export const topupSchema = z.object({
  amount: z.number().min(0.01, "金额最少 0.01").max(10000, "金额最多 10000"),
});

// PATCH /api/console/settings
export const updateSettingsSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
}).refine((data) => data.name !== undefined || data.email !== undefined, {
  message: "没有需要更新的字段",
});

// POST /api/console/settings/password
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "请提供当前密码"),
  newPassword: passwordSchema,
});
