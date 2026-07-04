import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Ism kamida 2 belgi"),
  email: z.string().email("Email noto'g'ri"),
  password: z
    .string()
    .min(8, "Parol kamida 8 belgidan iborat bo'lishi kerak")
    .regex(/[a-z]/, "Parolda kamida bitta kichik harf bo'lsin")
    .regex(/[A-Z]/, "Parolda kamida bitta katta harf bo'lsin")
    .regex(/[0-9]/, "Parolda kamida bitta raqam bo'lsin"),
  role: z.enum(["ADMIN", "USER"]).default("ADMIN"),
});

export const updateRoleSchema = z.object({
  role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Parol kamida 8 belgidan iborat bo'lishi kerak")
    .regex(/[a-z]/, "Parolda kamida bitta kichik harf bo'lsin")
    .regex(/[A-Z]/, "Parolda kamida bitta katta harf bo'lsin")
    .regex(/[0-9]/, "Parolda kamida bitta raqam bo'lsin"),
});

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]).optional(),
});
