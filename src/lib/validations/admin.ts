import { z } from "zod";
import { paginationSchema } from "./common";

// GET /api/admin/users query
export const adminUsersQuerySchema = paginationSchema.extend({
  search: z.string().optional().default(""),
  role: z.enum(["ADMIN", "USER"]).optional(),
});

// PATCH /api/admin/users/[id]
export const adminUpdateUserSchema = z.object({
  name: z.string().optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
}).refine((data) => data.name !== undefined || data.role !== undefined, {
  message: "没有可更新的字段",
});

// POST /api/admin/users/[id]/balance
export const adminAdjustBalanceSchema = z.object({
  amount: z.number().refine((v) => v !== 0, { message: "金额不能为零" }),
  description: z.string().optional(),
});

// GET /api/admin/models query
export const adminModelsQuerySchema = paginationSchema.extend({
  search: z.string().optional().default(""),
});

// POST /api/admin/models
export const adminCreateModelSchema = z.object({
  modelId: z.string().min(1, "modelId is required"),
  displayName: z.string().min(1, "displayName is required"),
  providerId: z.string().min(1, "providerId is required"),
  category: z.string().optional().default("chat"),
  inputPrice: z.number().min(0).optional().default(0),
  outputPrice: z.number().min(0).optional().default(0),
  sellPrice: z.number().min(0).optional().default(0),
  sellOutPrice: z.number().min(0).optional().default(0),
  maxContext: z.number().int().positive().optional().default(4096),
  isActive: z.boolean().optional().default(true),
});

// PATCH /api/admin/models/[id]
export const adminUpdateModelSchema = z.object({
  displayName: z.string().min(1).optional(),
  category: z.string().optional(),
  inputPrice: z.number().min(0).optional(),
  outputPrice: z.number().min(0).optional(),
  sellPrice: z.number().min(0).optional(),
  sellOutPrice: z.number().min(0).optional(),
  maxContext: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/channels query
export const adminChannelsQuerySchema = paginationSchema;

// POST /api/admin/channels
export const adminCreateChannelSchema = z.object({
  providerId: z.string().min(1, "providerId is required"),
  name: z.string().min(1, "name is required"),
  apiKey: z.string().min(1, "apiKey is required"),
  baseUrl: z.string().url().optional().nullable(),
  priority: z.number().int().min(0).optional().default(0),
  weight: z.number().int().min(1).optional().default(1),
  isActive: z.boolean().optional().default(true),
  models: z.array(z.string()).optional().default([]),
});

// PATCH /api/admin/channels/[id]
export const adminUpdateChannelSchema = z.object({
  name: z.string().min(1).optional(),
  providerId: z.string().min(1).optional(),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional().nullable(),
  priority: z.number().int().min(0).optional(),
  weight: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
  models: z.array(z.string()).optional(),
});

// GET /api/admin/logs query
export const adminLogsQuerySchema = paginationSchema.extend({
  userId: z.string().optional().default(""),
  modelId: z.string().optional().default(""),
  status: z.string().optional().default(""),
  dateFrom: z.string().optional().default(""),
  dateTo: z.string().optional().default(""),
});

// GET /api/admin/orders query
export const adminOrdersQuerySchema = paginationSchema.extend({
  search: z.string().optional().default(""),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

// POST /api/admin/orders/[id]/reject
export const adminRejectOrderSchema = z.object({
  adminRemark: z.string().min(1, "请填写拒绝原因").max(500),
});

// POST /api/admin/models/batch-price
export const adminBatchPriceSchema = z.object({
  modelIds: z.array(z.string().min(1)).min(1, "至少选择一个模型"),
  sellPrice: z.number().min(0).optional(),
  sellOutPrice: z.number().min(0).optional(),
  inputPrice: z.number().min(0).optional(),
  outputPrice: z.number().min(0).optional(),
});
