import { describe, it, expect } from "vitest";
import { getPagination, buildMeta } from "../pagination";

describe("getPagination", () => {
  it("standart qiymatlar", () => {
    expect(getPagination({})).toEqual({ page: 1, limit: 10, skip: 0 });
  });

  it("skip'ni to'g'ri hisoblaydi", () => {
    expect(getPagination({ page: 3, limit: 20 })).toEqual({ page: 3, limit: 20, skip: 40 });
  });

  it("yaroqsiz qiymatlarni standartga qaytaradi", () => {
    expect(getPagination({ page: "abc", limit: "-5" })).toEqual({ page: 1, limit: 10, skip: 0 });
    expect(getPagination({ page: 0 }).page).toBe(1);
  });

  it("limitni 100 bilan cheklaydi (ortiqcha yuklanishdan himoya)", () => {
    expect(getPagination({ limit: 5000 }).limit).toBe(100);
  });
});

describe("buildMeta", () => {
  it("sahifalar sonini va navigatsiya bayroqlarini hisoblaydi", () => {
    expect(buildMeta(45, 2, 10)).toEqual({
      total: 45, page: 2, limit: 10, totalPages: 5, hasNextPage: true, hasPrevPage: true,
    });
  });

  it("bo'sh natijada ham totalPages 1 bo'ladi", () => {
    const m = buildMeta(0, 1, 10);
    expect(m.totalPages).toBe(1);
    expect(m.hasNextPage).toBe(false);
    expect(m.hasPrevPage).toBe(false);
  });
});
