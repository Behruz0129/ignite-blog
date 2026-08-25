/**
 * EXPRESS APP
 * -----------
 * Bu yerda Express ilovasi yig'iladi: xavfsizlik, CORS, loglar, route'lar,
 * Swagger va xato ushlovchi middleware.
 *
 * server.ts esa shu ilovani ishga tushiradi (listen). Ajratish testlash
 * va deploy uchun qulay.
 */

import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import { corsOrigins, env } from "./config/env";
import { logger } from "./config/logger";
import { swaggerSpec } from "./config/swagger";
import { configurePassport } from "./config/passport";
import { readLimiter, writeLimiter } from "./middlewares/rateLimit.middleware";
import { notFound } from "./middlewares/notFound.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import apiRoutes from "./routes";

export function createApp(): Application {
  const app = express();

  // VPS ortida (Nginx reverse proxy) ishlaganda real IP'ni olish uchun
  app.set("trust proxy", 1);

  // 1) Xavfsizlik sarlavhalari
  app.use(helmet());

  // 2) CORS - faqat ruxsat etilgan originlarga
  app.use(
    cors({
      origin: (origin, callback) => {
        // origin yo'q (masalan Postman/Swagger/server-to-server) bo'lsa ruxsat
        if (!origin || corsOrigins.includes(origin)) {
          return callback(null, true);
        }

        // DIQQAT: bu yerda `callback(new Error(...))` qilinmaydi. Xato
        // qaytarilsa Express uni ichki nosozlik deb hisoblab **500** beradi
        // va brauzerda "Internal Server Error" ko'rinadi — aslida bu shunchaki
        // ruxsat yo'qligi. `false` esa javobga CORS sarlavhasini qo'ymaydi,
        // brauzer o'zi to'g'ri CORS xabarini chiqaradi.
        logger.warn(`CORS: ruxsat etilmagan origin rad etildi — ${origin}`);
        return callback(null, false);
      },
      credentials: true,
    })
  );

  // 3) Javoblarni siqish (gzip) - tezlik uchun
  app.use(compression());

  // 4) Body parserlar (JSON va form). Limit - katta kontent (maqolalar) uchun.
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Passport (OAuth) — sessiyasiz
  app.use(configurePassport().initialize());

  // 5) HTTP so'rovlar logi (logging middleware)
  const morganFormat = env.NODE_ENV === "development" ? "dev" : "combined";
  app.use(
    morgan(morganFormat, {
      stream: { write: (msg) => logger.http?.(msg.trim()) ?? logger.info(msg.trim()) },
    })
  );

  // 6) Rate limiting - faqat /api ostida.
  //    O'qish va yozuv alohida limitlarda: public GET so'rovlari keng
  //    limitga ega, chunki ular keshlanadi va SSR serveri ham shu yo'ldan
  //    o'tadi; yozuv amallari esa torroq limitda qoladi.
  app.use("/api", readLimiter, writeLimiter);

  // 7) Swagger hujjat
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));

  // 8) Asosiy route'lar
  app.use("/api", apiRoutes);

  // 9) Bosh sahifa (oddiy ko'rsatkich)
  app.get("/", (_req, res) => {
    res.json({
      success: true,
      message: "Ignite Blog API. Hujjat: /api/docs",
    });
  });

  // 10) 404 va xato ushlovchi (DOIM eng oxirida)
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
