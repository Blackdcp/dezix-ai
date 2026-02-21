import { z } from "zod";
import { emailSchema, passwordSchema, nameSchema } from "./common";

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  referralCode: z.string().optional(),
});
