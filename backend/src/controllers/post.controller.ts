/**
 * POST CONTROLLER (factory)
 * -------------------------
 * Yangiliklar, qo'llanmalar va maqolalar uchun bir xil controller — farq
 * faqat `type` da.
 *
 * `type` berilmasa (umumiy `/api/posts` yo'li) ro'yxat uchala turni aralash
 * qaytaradi. Bitta yozuvni slug bo'yicha olish esa turni talab qiladi: slug
 * tur ichida unikal, ya'ni `/news/x` va `/guides/x` bir vaqtda bo'lishi mumkin.
 *
 * Public endpointlar faqat PUBLISHED kontentni qaytaradi, admin endpointlar
 * himoyalangan.
 */

import { Request, Response } from "express";
import type { PostType } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, created, paginated } from "../utils/apiResponse";
import { postService } from "../services/post.service";
import { AppError } from "../utils/AppError";

export function createPostController(type?: PostType) {
  /** Turni talab qiladigan amallar uchun. */
  function requireType(): PostType {
    if (!type) {
      throw AppError.badRequest("Bu amal uchun kontent turi ko'rsatilishi kerak");
    }
    return type;
  }

  return {
    // --- PUBLIC ---
    publicList: asyncHandler(async (req: Request, res: Response) => {
      const { items, meta } = await postService.list({
        ...req.query,
        type,
        onlyPublished: true,
        userId: req.user?.id,
      });
      return paginated(res, items, meta);
    }),

    publicGetBySlug: asyncHandler(async (req: Request, res: Response) => {
      const item = await postService.getBySlug(
        requireType(),
        req.params.slug,
        true,
        req.user?.id
      );
      return ok(res, item);
    }),

    // --- ADMIN ---
    adminList: asyncHandler(async (req: Request, res: Response) => {
      const { items, meta } = await postService.list({ ...req.query, type });
      return paginated(res, items, meta);
    }),

    adminGetById: asyncHandler(async (req: Request, res: Response) => {
      const item = await postService.getById(req.params.id);
      return ok(res, item);
    }),

    create: asyncHandler(async (req: Request, res: Response) => {
      const item = await postService.create(requireType(), req.body, req.user?.id);
      return created(res, item, "Kontent yaratildi");
    }),

    update: asyncHandler(async (req: Request, res: Response) => {
      const item = await postService.update(req.params.id, req.body);
      return ok(res, item, "Kontent yangilandi");
    }),

    remove: asyncHandler(async (req: Request, res: Response) => {
      const result = await postService.remove(req.params.id);
      return ok(res, result, "Kontent o'chirildi");
    }),

    publish: asyncHandler(async (req: Request, res: Response) => {
      const item = await postService.setStatus(req.params.id, "PUBLISHED");
      return ok(res, item, "Chop etildi");
    }),

    unpublish: asyncHandler(async (req: Request, res: Response) => {
      const item = await postService.setStatus(req.params.id, "DRAFT");
      return ok(res, item, "Qoralamaga o'tkazildi");
    }),
  };
}
