import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email noto'g'ri"),
  password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token majburiy"),
});

export const telegramAuthSchema = z.object({
  id: z.coerce.number().int().positive(),
  first_name: z.string().min(1),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().optional(),
  auth_date: z.coerce.number().int(),
  hash: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
