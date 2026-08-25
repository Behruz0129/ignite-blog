// Backend API qaytaradigan ma'lumot tiplari (public qismi)

export type ContentStatus = "DRAFT" | "PUBLISHED";
export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface Taxonomy {
  id: string;
  name: string;
  slug: string;
}

/** Bazadagi tur nomi (`posts.type`). URL bo'lagi bilan aralashmasin. */
export type PostType = "NEWS" | "GUIDE" | "OPINION";

export interface ContentItem {
  id: string;
  /** Aralash ro'yxatda har element o'z turini bilishi kerak — havola shundan yasaladi. */
  type?: PostType;
  title: string;
  slug: string;
  excerpt?: string | null;
  // Diqqat: `content` faqat BITTA yozuv so'ralganda keladi (getBySlug).
  // Ro'yxat endpointlari uni qaytarmaydi — javob hajmini kichik saqlash uchun.
  content?: string;
  // O'qish vaqti serverda hisoblanadi, shuning uchun ro'yxatda ham mavjud.
  readingMinutes?: number;
  featuredImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  status: ContentStatus;
  difficulty?: Difficulty;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  categories?: Taxonomy[];
  tags?: Taxonomy[];
  author?: { id: string; name: string } | null;
  _count?: { comments: number; likes: number };
  likedByMe?: boolean;
  comments?: PublicComment[];
  // Tasdiqlangan izohlarning umumiy soni (comments massivi cheklangan)
  commentCount?: number;
}

export interface PublicComment {
  id: string;
  authorName?: string | null;
  content: string;
  createdAt: string;
  user?: { id: string; name: string; avatar?: string | null } | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

// Kontent turi (yo'llar va sarlavhalar uchun)
export type ContentType = "news" | "guides" | "opinions";

/** Foydali havolalar bo'limi elementi. */
export interface Resource {
  id: string;
  title: string;
  description?: string | null;
  url: string;
  image?: string | null;
  group?: string | null;
  order: number;
  createdAt: string;
}

export interface ResourceGroups {
  total: number;
  groups: { name: string; items: Resource[] }[];
}
