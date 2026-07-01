/**
 * DASHBOARD SERVICE
 * -----------------
 * Admin bosh sahifasi uchun statistika to'playdi.
 * Barcha sanoqlarni parallel (Promise.all) bajaramiz - tezroq.
 */

import { prisma } from "../config/prisma";

export const dashboardService = {
  async getStats() {
    const [
      totalNews,
      publishedNews,
      totalGuides,
      publishedGuides,
      totalOpinions,
      publishedOpinions,
      totalComments,
      pendingComments,
      totalCategories,
      totalTags,
      totalMedia,
    ] = await Promise.all([
      prisma.news.count(),
      prisma.news.count({ where: { status: "PUBLISHED" } }),
      prisma.guide.count(),
      prisma.guide.count({ where: { status: "PUBLISHED" } }),
      prisma.opinion.count(),
      prisma.opinion.count({ where: { status: "PUBLISHED" } }),
      prisma.comment.count(),
      prisma.comment.count({ where: { status: "PENDING" } }),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.media.count(),
    ]);

    // So'nggi izohlar (moderatsiya uchun qulay)
    const recentComments = await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return {
      counts: {
        news: { total: totalNews, published: publishedNews },
        guides: { total: totalGuides, published: publishedGuides },
        opinions: { total: totalOpinions, published: publishedOpinions },
        comments: { total: totalComments, pending: pendingComments },
        categories: totalCategories,
        tags: totalTags,
        media: totalMedia,
      },
      recentComments,
    };
  },
};
