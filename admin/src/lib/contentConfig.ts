// News/Guides/Opinions sahifalari deyarli bir xil. Farqlarni shu konfigda
// saqlaymiz va bitta komponentni qayta ishlatamiz.

export type ContentType = "news" | "guides" | "opinions";

export interface ContentConfig {
  type: ContentType;
  apiPath: string; // backend yo'li (masalan /news)
  title: string; // ko'p son (sahifa sarlavhasi)
  singular: string; // birlik (tugmalar uchun)
  hasDifficulty: boolean; // faqat guides uchun true
}

export const CONTENT_CONFIG: Record<ContentType, ContentConfig> = {
  news: {
    type: "news",
    apiPath: "/news",
    title: "Yangiliklar",
    singular: "yangilik",
    hasDifficulty: false,
  },
  guides: {
    type: "guides",
    apiPath: "/guides",
    title: "Qo'llanmalar",
    singular: "qo'llanma",
    hasDifficulty: true,
  },
  opinions: {
    type: "opinions",
    apiPath: "/opinions",
    title: "Maqolalar",
    singular: "maqola",
    hasDifficulty: false,
  },
};
