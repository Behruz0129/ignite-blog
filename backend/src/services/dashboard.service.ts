/**
 * DASHBOARD SERVICE
 * -----------------
 * Admin bosh sahifasi uchun statistika to'playdi.
 * Barcha sanoqlarni parallel (Promise.all) bajaramiz - tezroq.
 */

import { prisma } from "../config/prisma";

export const dashboardService = {
  async getStats() {
    // Kontent bitta jadvalda bo'lgani uchun turlar bo'yicha sanoq bitta
    // guruhlangan so'rov bilan olinadi — ilgari olti alohida count kerak edi.
    const [byType, totalComments, pendingComments, totalCategories, totalTags, totalMedia] =
      await Promise.all([
        prisma.post.groupBy({
          by: ["type", "status"],
          _count: { _all: true },
        }),
        prisma.comment.count(),
        prisma.comment.count({ where: { status: "PENDING" } }),
        prisma.category.count(),
        prisma.tag.count(),
        prisma.media.count(),
      ]);

    /** Tur bo'yicha jami va chop etilganlar sonini yig'adi. */
    const countFor = (type: "NEWS" | "GUIDE" | "OPINION") => {
      const rows = byType.filter((r) => r.type === type);
      const total = rows.reduce((sum, r) => sum + r._count._all, 0);
      const published =
        rows.find((r) => r.status === "PUBLISHED")?._count._all ?? 0;
      return { total, published };
    };

    // So'nggi izohlar (moderatsiya uchun qulay).
    // "user" ni ham olamiz: eski yozuvlarda authorName bo'sh bo'lishi mumkin,
    // bunday holda ism ro'yxatdan o'tgan foydalanuvchidan olinadi.
    const recentComments = await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return {
      counts: {
        news: countFor("NEWS"),
        guides: countFor("GUIDE"),
        opinions: countFor("OPINION"),
        comments: { total: totalComments, pending: pendingComments },
        categories: totalCategories,
        tags: totalTags,
        media: totalMedia,
      },
      recentComments,
    };
  },
};
