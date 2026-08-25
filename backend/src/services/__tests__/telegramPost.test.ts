import { describe, it, expect } from "vitest";
import { buildMessage, toHashtag } from "../telegramPost.service";

describe("toHashtag", () => {
  it("bo'sh joyni pastki chiziqqa aylantiradi", () => {
    expect(toHashtag("PC o'yinlar")).toBe("#PC_oyinlar");
  });

  it("kirill nomlarni ham qabul qiladi", () => {
    expect(toHashtag("Новости")).toBe("#Новости");
  });

  it("tinish belgilarini tashlaydi", () => {
    expect(toHashtag("RPG / Strategiya!")).toBe("#RPG_Strategiya");
  });

  it("faqat belgidan iborat nomda bo'sh qaytaradi", () => {
    expect(toHashtag("!!!")).toBe("");
  });
});

describe("buildMessage", () => {
  const item = {
    id: "1",
    type: "NEWS" as const,
    title: "Ashen Vale 2 qishki yangilanishi",
    slug: "ashen-vale-2",
    excerpt: "Yangi xarita va reyd bossi.",
    categories: [{ name: "PC o'yinlar" }],
    tags: [{ name: "RPG" }],
  };

  it("sarlavha, tavsif va havolani qo'shadi", () => {
    const msg = buildMessage(item);
    expect(msg).toContain("Ashen Vale 2 qishki yangilanishi");
    expect(msg).toContain("Yangi xarita va reyd bossi.");
    expect(msg).toContain("/news/ashen-vale-2");
  });

  it("kontent turiga qarab to'g'ri yo'l tanlaydi", () => {
    expect(buildMessage({ ...item, type: "GUIDE" })).toContain("/guides/ashen-vale-2");
    expect(buildMessage({ ...item, type: "OPINION" })).toContain("/opinions/ashen-vale-2");
  });

  it("kategoriya va teglardan hashtag yasaydi", () => {
    const msg = buildMessage(item);
    expect(msg).toContain("#PC_oyinlar");
    expect(msg).toContain("#RPG");
  });

  it("HTML belgilarini escape qiladi — aks holda Telegram xabarni rad etadi", () => {
    const msg = buildMessage({
      ...item,
      title: "<b>Qalin</b> & boshqa",
      excerpt: "5 < 10",
    });
    expect(msg).toContain("&lt;b&gt;Qalin&lt;/b&gt; &amp; boshqa");
    expect(msg).toContain("5 &lt; 10");
  });

  it("tavsif bo'lmasa ham xabar yasaladi", () => {
    const msg = buildMessage({ ...item, excerpt: null });
    expect(msg).toContain("Ashen Vale 2");
    expect(msg).not.toContain("\n\n\n");
  });

  it("teg bo'lmasa ham yiqilmaydi", () => {
    const msg = buildMessage({ ...item, categories: [], tags: [] });
    expect(msg).toContain("Batafsil o'qish");
  });

  it("beshtadan ortiq teg qo'shmaydi", () => {
    const many = Array.from({ length: 9 }, (_, i) => ({ name: `Teg${i}` }));
    const msg = buildMessage({ ...item, categories: many, tags: [] });
    expect(msg.match(/#Teg\d/g)?.length).toBe(5);
  });
});
