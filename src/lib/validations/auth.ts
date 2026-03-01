import { z } from "zod";
import { emailSchema, passwordSchema, nameSchema } from "./common";

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  referralCode: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "TOKEN_REQUIRED"),
  password: passwordSchema,
});
