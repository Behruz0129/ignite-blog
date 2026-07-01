/**
 * LOGGER (Winston)
 * ----------------
 * console.log o'rniga professional logger ishlatamiz.
 * - development: rangli, o'qishga qulay
 * - production: JSON formatda (log yig'uvchi tizimlar uchun qulay)
 */

import winston from "winston";
import { env } from "./env";

const { combine, timestamp, printf, colorize, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

const prodFormat = combine(timestamp(), json());

export const logger = winston.createLogger({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  format: env.NODE_ENV === "development" ? devFormat : prodFormat,
  transports: [new winston.transports.Console()],
});
