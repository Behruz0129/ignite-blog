/**
 * slugify
 * -------
 * Sarlavhadan URL uchun qulay "slug" yasaydi.
 *   "Yangi O'yin Chiqdi!"     ->  "yangi-oyin-chiqdi"
 *   "Янгиликлар дунёси"       ->  "yangiliklar-dunyosi"
 *
 * Kirill harflar lotinga o'giriladi (translit), aks holda ular butunlay
 * tashlab yuborilar va slug bo'sh qolar edi.
 *
 * generateUniqueSlug - bazada bir xil slug bo'lsa oxiriga -2, -3 qo'shadi.
 */

/** Kirill (o'zbek/rus) -> lotin. Uzunroq ketma-ketliklar oldin turishi kerak. */
const CYRILLIC_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", ғ: "g", д: "d", е: "e", ё: "yo",
  ж: "j", з: "z", и: "i", й: "y", к: "k", қ: "q", л: "l", м: "m",
  н: "n", о: "o", ў: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "x", ҳ: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sh",
  ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya",
};

function transliterate(text: string): string {
  return text.replace(/[Ѐ-ӿ]/g, (ch) => CYRILLIC_MAP[ch.toLowerCase()] ?? "");
}

export function slugify(text: string): string {
  return transliterate(text.toString())
    .normalize("NFKD") // urg'uli harflarni ajratadi
    .replace(/[\u0300-\u036f]/g, "") // urg'u belgilarini olib tashlaydi
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // harf/raqam/probel/tiredan boshqasini olib tashlaydi
    .replace(/\s+/g, "-") // probellarni tirega aylantiradi
    .replace(/-+/g, "-") // ketma-ket tirelarni bittaga
    .replace(/^-+|-+$/g, ""); // boshi/oxiridagi tirelarni olib tashlaydi
}

/**
 * Bazada slug band bo'lmaganini tekshiradi va kerak bo'lsa raqam qo'shadi.
 *
 * Diqqat: `base` bo'sh bo'lishi mumkin (masalan sarlavha faqat emoji yoki
 * ieroglifdan iborat bo'lsa). Shunda "post" zaxira nomiga o'tamiz va
 * raqamlarni ham SHU zaxira nomga qo'shamiz — aks holda "-2", "-3" kabi
 * yaroqsiz sluglar hosil bo'lardi.
 *
 * @param base    boshlang'ich slug (slugify natijasi)
 * @param exists  async funksiya: slug band bo'lsa true qaytaradi
 */
export async function generateUniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  const safeBase = base || "post";
  let slug = safeBase;
  let counter = 2;

  while (await exists(slug)) {
    slug = `${safeBase}-${counter}`;
    counter++;
  }

  return slug;
}
