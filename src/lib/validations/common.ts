import { z } from "zod";

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

// Common fields
export const emailSchema = z.string().email("邮箱格式无效");
export const passwordSchema = z.string().min(8, "密码至少 8 位");
export const nameSchema = z.string().min(1, "姓名不能为空").trim();
