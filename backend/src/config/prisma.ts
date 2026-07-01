/**
 * PRISMA CLIENT (singleton)
 * -------------------------
 * Butun ilova bo'ylab BITTA Prisma client nusxasidan foydalanamiz.
 * Aks holda har bir import yangi ulanish hovuzini ochib, bazani "bo'g'ib"
 * qo'yishi mumkin. globalThis orqali dev rejimida hot-reloadda ham
 * takror ulanish yaratilmasligini ta'minlaymiz.
 */

import { PrismaClient } from "@prisma/client";
import { env } from "./env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
