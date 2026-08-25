import { describe, it, expect } from "vitest";
import { calcReadingMinutes } from "../readingTime";

describe("calcReadingMinutes", () => {
  const words = (n: number) => "<p>" + "so'z ".repeat(n) + "</p>";

  it("bo'sh matnda ham kamida 1 daqiqa qaytaradi", () => {
    expect(calcReadingMinutes("")).toBe(1);
    expect(calcReadingMinutes("<p></p>")).toBe(1);
  });

  it("200 so'z/daqiqa hisobida yaxlitlaydi", () => {
    expect(calcReadingMinutes(words(200))).toBe(1);
    expect(calcReadingMinutes(words(1000))).toBe(5);
    expect(calcReadingMinutes(words(1400))).toBe(7);
  });

  it("HTML teglarini so'z deb sanamaydi", () => {
    const withTags = "<h2>bir</h2><p><strong>ikki</strong> uch</p>";
    const plain = "<p>bir ikki uch</p>";
    expect(calcReadingMinutes(withTags)).toBe(calcReadingMinutes(plain));
  });
});
