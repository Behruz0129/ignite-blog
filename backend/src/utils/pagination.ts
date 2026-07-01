/**
 * pagination
 * ----------
 * Query parametrlardan (?page=2&limit=10) sahifalash qiymatlarini ajratadi
 * va Prisma uchun "skip / take" hisoblaydi.
 * Bundan tashqari javob uchun meta ma'lumot (jami, sahifalar soni) tayyorlaydi.
 */

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function getPagination(query: Record<string, unknown>): PaginationParams {
  let page = parseInt(String(query.page ?? "1"), 10);
  let limit = parseInt(String(query.limit ?? "10"), 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100; // ortiqcha yuklanishning oldini olamiz

  return { page, limit, skip: (page - 1) * limit };
}

export function buildMeta(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
