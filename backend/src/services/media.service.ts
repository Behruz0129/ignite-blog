/**
 * MEDIA SERVICE (Cloudinary)
 * --------------------------
 * - upload: buffer'ni Cloudinary'ga stream orqali yuklaydi va natijani
 *   bazaga (Media jadvali) saqlaydi.
 * - list: yuklangan rasmlar ro'yxati (qayta ishlatish uchun).
 * - remove: ham Cloudinary'dan, ham bazadan o'chiradi.
 */

import { cloudinary } from "../config/cloudinary";
import { env, isCloudinaryConfigured } from "../config/env";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { getPagination, buildMeta } from "../utils/pagination";
import type { UploadApiResponse } from "cloudinary";

export const mediaService = {
  async upload(file?: Express.Multer.File) {
    if (!isCloudinaryConfigured) {
      throw AppError.badRequest(
        "Cloudinary sozlanmagan. .env faylga CLOUDINARY_* qiymatlarini qo'shing."
      );
    }
    if (!file) throw AppError.badRequest("Fayl yuborilmadi");

    // Buffer'ni stream orqali Cloudinary'ga yuborish (Promise'ga o'raymiz)
    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: env.CLOUDINARY_FOLDER, resource_type: "image" },
        (error, res) => {
          if (error) return reject(error);
          if (!res) return reject(new Error("Cloudinary javob bermadi"));
          resolve(res);
        }
      );
      stream.end(file.buffer);
    });

    // Natijani bazaga saqlaymiz (media kutubxonada ko'rinishi uchun)
    return prisma.media.create({
      data: {
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
    });
  },

  async list(opts: { page?: number; limit?: number }) {
    const { page, limit, skip } = getPagination(opts as Record<string, unknown>);
    const [items, total] = await Promise.all([
      prisma.media.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.media.count(),
    ]);
    return { items, meta: buildMeta(total, page, limit) };
  },

  async remove(id: string) {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) throw AppError.notFound("Media topilmadi");

    if (isCloudinaryConfigured) {
      try {
        await cloudinary.uploader.destroy(media.publicId);
      } catch {
        // Cloudinary'da bo'lmasa ham bazadan o'chiramiz
      }
    }

    await prisma.media.delete({ where: { id } });
    return { id };
  },
};
