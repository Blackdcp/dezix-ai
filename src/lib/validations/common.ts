import { z } from "zod";

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

// Common fields
export const emailSchema = z.string().email("INVALID_EMAIL");
export const passwordSchema = z.string().min(8, "PASSWORD_TOO_SHORT");
export const nameSchema = z.string().min(1, "NAME_REQUIRED").trim();
