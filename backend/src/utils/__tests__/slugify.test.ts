import { describe, it, expect } from "vitest";
import { slugify, generateUniqueSlug } from "../slugify";

describe("slugify", () => {
  it("lotin sarlavhani odatdagidek o'giradi", () => {
    expect(slugify("Yangi O'yin Chiqdi!")).toBe("yangi-oyin-chiqdi");
    expect(slugify("  Ko'p    probel  ")).toBe("kop-probel");
    expect(slugify("GTA VI: 2026")).toBe("gta-vi-2026");
  });

  it("kirill sarlavhani lotinga o'giradi (regressiya: avval bo'sh satr qaytarardi)", () => {
    expect(slugify("Янгиликлар дунёси")).toBe("yangiliklar-dunyosi");
    expect(slugify("Кўрсатув бошланди")).toBe("korsatuv-boshlandi");
    expect(slugify("Ўзбекистон чемпиони")).toBe("ozbekiston-chempioni");
    expect(slugify("Совсем другая новость")).toBe("sovsem-drugaya-novost");
  });

  it("aralash sarlavhani ham uddalaydi", () => {
    expect(slugify("Патч 2.1 update")).toBe("patch-21-update");
  });

  it("tarjima qilib bo'lmaydigan sarlavhada bo'sh satr qaytaradi", () => {
    expect(slugify("🎮🔥")).toBe("");
    expect(slugify("///")).toBe("");
  });
});

describe("generateUniqueSlug", () => {
  const taken = (...slugs: string[]) => async (s: string) => slugs.includes(s);

  it("band bo'lmasa o'zini qaytaradi", async () => {
    expect(await generateUniqueSlug("gta-vi", taken())).toBe("gta-vi");
  });

  it("band bo'lsa raqam qo'shadi", async () => {
    expect(await generateUniqueSlug("gta-vi", taken("gta-vi"))).toBe("gta-vi-2");
    expect(await generateUniqueSlug("gta-vi", taken("gta-vi", "gta-vi-2"))).toBe("gta-vi-3");
  });

  it("bo'sh base'da 'post' zaxirasiga o'tadi (regressiya: avval '-2' yasardi)", async () => {
    expect(await generateUniqueSlug("", taken())).toBe("post");
    expect(await generateUniqueSlug("", taken("post"))).toBe("post-2");
    expect(await generateUniqueSlug("", taken("post", "post-2"))).toBe("post-3");
  });
});
