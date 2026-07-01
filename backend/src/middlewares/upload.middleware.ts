/**
 * UPLOAD MIDDLEWARE (Multer)
 * --------------------------
 * Faylni xotirada (memory) buffer sifatida ushlab turamiz, so'ng uni
 * Cloudinary'ga oqim (stream) orqali yuboramiz. Diskka yozmaymiz - bu VPS'da
 * joy tejaydi va tezroq.
 *
 * Faqat rasm fayllariga ruxsat beramiz va hajmni 5MB bilan cheklaymiz.
 */

import multer from "multer";
import { AppError } from "../utils/AppError";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(AppError.badRequest("Faqat rasm fayllariga ruxsat berilgan."));
    }
  },
});
