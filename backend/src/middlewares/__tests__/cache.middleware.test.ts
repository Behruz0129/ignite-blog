import { describe, it, expect } from "vitest";
import type { Request, Response } from "express";
import { publicCache } from "../cache.middleware";

// Minimal soxta req/res — Express'ning butun obyektini qurish shart emas
function run(opts: { method?: string; authorization?: string }, mw = publicCache()) {
  const headers: Record<string, string> = {};
  const req = {
    method: opts.method ?? "GET",
    headers: opts.authorization ? { authorization: opts.authorization } : {},
  } as unknown as Request;
  const res = {
    setHeader: (k: string, v: string) => {
      headers[k] = v;
    },
  } as unknown as Response;
  let nextCalled = false;
  mw(req, res, () => {
    nextCalled = true;
  });
  return { headers, nextCalled };
}

describe("publicCache", () => {
  it("anonim GET javobini CDN keshlashiga ruxsat beradi", () => {
    const { headers, nextCalled } = run({});
    expect(headers["Cache-Control"]).toContain("public");
    expect(headers["Cache-Control"]).toContain("s-maxage=60");
    expect(headers["Cache-Control"]).toContain("stale-while-revalidate=300");
    expect(nextCalled).toBe(true);
  });

  it("Authorization bo'lsa keshlamaydi (javob likedByMe bilan shaxsiylashadi)", () => {
    const { headers } = run({ authorization: "Bearer xyz" });
    expect(headers["Cache-Control"]).toBe("private, no-store");
  });

  it("GET bo'lmagan so'rovni keshlamaydi", () => {
    expect(run({ method: "POST" }).headers["Cache-Control"]).toBe("private, no-store");
  });

  it("har doim Vary: Authorization qo'yadi (oraliq keshlar adashmasligi uchun)", () => {
    for (const c of [run({}), run({ authorization: "Bearer x" }), run({ method: "POST" })]) {
      expect(c.headers["Vary"]).toContain("Authorization");
    }
  });

  it("muddatni sozlash mumkin", () => {
    const { headers } = run({}, publicCache(300, 3600));
    expect(headers["Cache-Control"]).toContain("s-maxage=300");
    expect(headers["Cache-Control"]).toContain("stale-while-revalidate=3600");
  });
});
