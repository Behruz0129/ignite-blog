import { describe, it, expect, vi } from "vitest";
import type { Request, Response } from "express";
import { createState, verifyState } from "../oauthState";

/** Cookie o'rnatishni yozib boradigan soxta Response. */
function fakeRes() {
  const cookies: Record<string, string> = {};
  const cleared: string[] = [];
  const res = {
    cookie: vi.fn((name: string, value: string) => {
      cookies[name] = value;
    }),
    clearCookie: vi.fn((name: string) => {
      cleared.push(name);
      delete cookies[name];
    }),
  } as unknown as Response;
  return { res, cookies, cleared };
}

function fakeReq(query: Record<string, unknown>, cookies: Record<string, string>) {
  return { query, cookies } as unknown as Request;
}

describe("oauthState", () => {
  it("state yaratadi va uni cookie'ga yozadi", () => {
    const { res, cookies } = fakeRes();
    const state = createState(res);

    expect(state).toHaveLength(64); // 32 bayt hex
    expect(cookies["oauth_state"]).toBe(state);
  });

  it("har safar yangi qiymat beradi", () => {
    const a = createState(fakeRes().res);
    const b = createState(fakeRes().res);
    expect(a).not.toBe(b);
  });

  it("cookie va query mos kelsa o'tkazadi", () => {
    const { res, cookies } = fakeRes();
    const state = createState(res);

    const check = fakeRes();
    expect(verifyState(fakeReq({ state }, cookies), check.res)).toBe(true);
  });

  it("mos kelmasa rad etadi", () => {
    const { res, cookies } = fakeRes();
    createState(res);

    const check = fakeRes();
    expect(
      verifyState(fakeReq({ state: "b".repeat(64) }, cookies), check.res)
    ).toBe(false);
  });

  it("cookie bo'lmasa rad etadi — hujumchi uni qurbon brauzeriga qo'ya olmaydi", () => {
    const check = fakeRes();
    expect(verifyState(fakeReq({ state: "a".repeat(64) }, {}), check.res)).toBe(false);
  });

  it("query'da state bo'lmasa rad etadi", () => {
    const { res, cookies } = fakeRes();
    createState(res);

    const check = fakeRes();
    expect(verifyState(fakeReq({}, cookies), check.res)).toBe(false);
  });

  it("tekshiruvdan keyin cookie o'chiriladi (kod bir marta ishlaydi)", () => {
    const { res, cookies } = fakeRes();
    const state = createState(res);

    const check = fakeRes();
    verifyState(fakeReq({ state }, cookies), check.res);
    expect(check.cleared).toContain("oauth_state");
  });

  it("turli uzunlikdagi qiymatda yiqilmaydi (timingSafeEqual talabi)", () => {
    const { res, cookies } = fakeRes();
    createState(res);

    const check = fakeRes();
    expect(() =>
      verifyState(fakeReq({ state: "qisqa" }, cookies), check.res)
    ).not.toThrow();
  });
});
