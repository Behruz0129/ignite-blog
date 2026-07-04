import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email noto'g'ri"),
  password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Ism kamida 2 belgi"),
  email: z.string().email("Email noto'g'ri"),
  password: z
    .string()
    .min(8, "Parol kamida 8 belgidan iborat bo'lishi kerak")
    .regex(/[a-z]/, "Parolda kamida bitta kichik harf bo'lsin")
    .regex(/[A-Z]/, "Parolda kamida bitta katta harf bo'lsin")
    .regex(/[0-9]/, "Parolda kamida bitta raqam bo'lsin"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token majburiy"),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token majburiy"),
});

export const resendVerificationSchema = z.object({
  email: z.string().email("Email noto'g'ri"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email noto'g'ri"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token majburiy"),
  password: z
    .string()
    .min(8, "Parol kamida 8 belgidan iborat bo'lishi kerak")
    .regex(/[a-z]/, "Parolda kamida bitta kichik harf bo'lsin")
    .regex(/[A-Z]/, "Parolda kamida bitta katta harf bo'lsin")
    .regex(/[0-9]/, "Parolda kamida bitta raqam bo'lsin"),
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
export type RegisterInput = z.infer<typeof registerSchema>;
