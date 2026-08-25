import { describe, it, expect } from "vitest";
import { generateSecureToken, hashToken, tokenExpiryHours } from "../secureToken";

describe("generateSecureToken", () => {
  it("64 belgili hex qaytaradi (32 bayt)", () => {
    const t = generateSecureToken();
    expect(t).toHaveLength(64);
    expect(t).toMatch(/^[0-9a-f]+$/);
  });

  it("har safar boshqa qiymat", () => {
    const set = new Set(Array.from({ length: 100 }, () => generateSecureToken()));
    expect(set.size).toBe(100);
  });
});

describe("hashToken", () => {
  it("bir xil kirishga bir xil hash (qidiruv shunga tayanadi)", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
  });

  it("hash asl tokendan farq qiladi", () => {
    const raw = generateSecureToken();
    expect(hashToken(raw)).not.toBe(raw);
  });

  it("hash'ni qayta hash qilish asl hash'ni bermaydi", () => {
    // Regressiya: bazadagi hash bilan "kirish" mumkin bo'lmasligi kerak.
    // Servis kelgan tokenni hash qilib qidiradi, ya'ni hash yuborilsa
    // hash(hash) qidiriladi va topilmaydi.
    const raw = generateSecureToken();
    const stored = hashToken(raw);
    expect(hashToken(stored)).not.toBe(stored);
  });
});

describe("tokenExpiryHours", () => {
  it("kelajakdagi vaqtni qaytaradi", () => {
    const now = Date.now();
    const oneHour = tokenExpiryHours(1).getTime();
    expect(oneHour).toBeGreaterThan(now + 59 * 60 * 1000);
    expect(oneHour).toBeLessThan(now + 61 * 60 * 1000);
  });
});
