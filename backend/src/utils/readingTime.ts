/**
 * O'qish vaqti (daqiqa)
 * ---------------------
 * Maqola HTML'idan taxminiy o'qish vaqtini hisoblaydi va uni bazaga
 * yozib qo'yamiz.
 *
 * Nega bazada? Ro'yxat endpointlari (bosh sahifa, /news va h.k.) endi
 * `content` ni umuman qaytarmaydi — u o'nlab kilobayt bo'lib, ro'yxatda
 * ko'rsatilmaydi. Lekin kartochkada "5 daqiqa o'qish" yozuvi kerak, shuning
 * uchun bu qiymat yozish paytida bir marta hisoblanadi.
 */

const WORDS_PER_MINUTE = 200;

export function calcReadingMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
