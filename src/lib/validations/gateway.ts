import { z } from "zod";

const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.union([z.string(), z.null()]).optional(),
  name: z.string().optional(),
  tool_calls: z.array(z.any()).optional(),
  tool_call_id: z.string().optional(),
});

export const chatCompletionRequestSchema = z.object({
  model: z.string().min(1, "'model' is required"),
  messages: z.array(chatMessageSchema).min(1, "'messages' must be a non-empty array"),
  stream: z.boolean().optional(),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  max_tokens: z.number().int().positive().optional(),
  n: z.number().int().positive().optional(),
  stop: z.union([z.string(), z.array(z.string())]).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  tools: z.array(z.any()).optional(),
  tool_choice: z.any().optional(),
});
