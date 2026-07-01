/**
 * CLOUDINARY CONFIG
 * -----------------
 * Rasm yuklash xizmati. Bu yerda faqat sozlaymiz;
 * yuklash/o'chirish logikasi services/media.service.ts da.
 */

import { v2 as cloudinary } from "cloudinary";
import { env, isCloudinaryConfigured } from "./env";
import { logger } from "./logger";

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  logger.info("Cloudinary sozlandi ✔");
} else {
  logger.warn(
    "Cloudinary sozlanmagan. Media yuklash ishlamaydi. .env ga CLOUDINARY_* qiymatlarini qo'shing."
  );
}

export { cloudinary };
