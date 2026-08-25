/**
 * KONTENT SANITIZATSIYASI
 * -----------------------
 * Maqola matni Tiptap muharriridan HTML ko'rinishida keladi va public saytda
 * `dangerouslySetInnerHTML` orqali chiziladi. Ya'ni bazadagi HTML — bevosita
 * brauzerda bajariladigan kod.
 *
 * Nega kerak? Maqola yozish huquqi faqat ADMIN'da bo'lsa ham, ADMIN
 * SUPER_ADMIN emas. Buzg'unchi (yoki o'g'irlangan) ADMIN akkaunt maqolaga
 * <script> joylab, o'sha maqolani ochgan SUPER_ADMIN'ning tokenini o'g'irlashi
 * mumkin edi — ya'ni huquq oshirish (privilege escalation) yo'li.
 *
 * Shuning uchun HTML SAQLASHDAN OLDIN filtrlanadi: faqat muharrir haqiqatan
 * ishlab chiqaradigan teglar va atributlar qoladi.
 */

import sanitizeHtml from "sanitize-html";

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    // Matn tuzilishi
    "p", "br", "hr", "div", "span",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "blockquote", "pre", "code",
    // Ro'yxatlar
    "ul", "ol", "li",
    // Matn bezaklari
    "strong", "b", "em", "i", "u", "s", "strike", "sup", "sub", "mark",
    // Havola va media
    "a", "img", "figure", "figcaption",
    // Jadval (Tiptap table kengaytmasi)
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "colgroup", "col",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "title"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    // lowlight/tiptap sintaksis bo'yash uchun class qo'yadi
    code: ["class"],
    pre: ["class"],
    span: ["class"],
    div: ["class"],
    th: ["colspan", "rowspan", "colwidth", "style"],
    td: ["colspan", "rowspan", "colwidth", "style"],
    col: ["style"],
  },
  // javascript: va data: sxemalarini bloklaymiz (data: rasm ham bo'lishi
  // mumkin, lekin u bazani shishiradi — rasmlar Cloudinary'da turishi kerak)
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  // style atributida faqat jadval kengligi kabi zararsiz qiymatlar
  allowedStyles: {
    "*": {
      width: [/^\d+(?:px|%)$/],
      "text-align": [/^(left|right|center|justify)$/],
    },
  },
  transformTags: {
    // Tashqi havolalar yangi oynada va tabnabbing'siz ochilsin
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        ...(attribs.target === "_blank"
          ? { rel: "noopener noreferrer nofollow" }
          : {}),
      },
    }),
  },
  // <script>/<style> ichidagi matn ham butunlay tashlansin
  // (standart holatda teg olib tashlanadi, matni qoladi)
  nonTextTags: ["script", "style", "textarea", "option", "noscript", "iframe"],
};

export function sanitizeContent(html: string): string {
  return sanitizeHtml(html, OPTIONS);
}
