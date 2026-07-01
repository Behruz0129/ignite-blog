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
import { apiLimiter } from "./middlewares/rateLimit.middleware";
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
        return callback(new Error("CORS tomonidan bloklandi: " + origin));
      },
      credentials: true,
    })
  );

  // 3) Javoblarni siqish (gzip) - tezlik uchun
  app.use(compression());

  // 4) Body parserlar (JSON va form). Limit - katta kontent (maqolalar) uchun.
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  // 5) HTTP so'rovlar logi (logging middleware)
  const morganFormat = env.NODE_ENV === "development" ? "dev" : "combined";
  app.use(
    morgan(morganFormat, {
      stream: { write: (msg) => logger.http?.(msg.trim()) ?? logger.info(msg.trim()) },
    })
  );

  // 6) Rate limiting - faqat /api ostida
  app.use("/api", apiLimiter);

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
