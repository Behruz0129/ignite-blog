/**
 * slugify
 * -------
 * Sarlavhadan URL uchun qulay "slug" yasaydi.
 *   "Yangi O'yin Chiqdi!"  ->  "yangi-oyin-chiqdi"
 *
 * generateUniqueSlug - bazada bir xil slug bo'lsa oxiriga -2, -3 qo'shadi.
 */

export function slugify(text: string): string {
  return text
    .toString()
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
 * @param base       boshlang'ich slug (slugify natijasi)
 * @param exists     async funksiya: slug band bo'lsa true qaytaradi
 */
export async function generateUniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = base || "post";
  let counter = 2;

  while (await exists(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}
