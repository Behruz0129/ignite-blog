/**
 * SERVER ENTRYPOINT
 * -----------------
 * Ilovani ishga tushiradi va xavfsiz to'xtatish (graceful shutdown) ni
 * ta'minlaydi.
 *
 * Ishga tushirish:
 *   npm run dev    (development, avtomatik qayta yuklash)
 *   npm start      (production, oldin "npm run build" qilingan bo'lishi kerak)
 */

import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./config/prisma";

async function bootstrap() {
  // Bazaga ulanishni tekshiramiz (xato bo'lsa darrov bilamiz)
  try {
    await prisma.$connect();
    logger.info("PostgreSQL'ga ulanish muvaffaqiyatli ✔");
  } catch (err) {
    logger.error("Bazaga ulanib bo'lmadi. DATABASE_URL ni tekshiring.");
    logger.error(String(err));
    process.exit(1);
  }

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀  Server ishga tushdi: http://localhost:${env.PORT}`);
    logger.info(`📚  API hujjat: http://localhost:${env.PORT}/api/docs`);
    logger.info(`🌱  Muhit: ${env.NODE_ENV}`);
  });

  // Graceful shutdown: signal kelganda ulanishlarni toza yopamiz
  const shutdown = async (signal: string) => {
    logger.info(`${signal} qabul qilindi. Server to'xtatilmoqda...`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info("Server toza to'xtatildi.");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  // Kutilmagan xatolarni ushlash
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Rejection: " + String(reason));
  });
  process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception: " + err.message);
    process.exit(1);
  });
}

bootstrap();
