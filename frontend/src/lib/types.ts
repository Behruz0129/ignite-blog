// Backend API qaytaradigan ma'lumot tiplari (public qismi)

export type ContentStatus = "DRAFT" | "PUBLISHED";
export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface Taxonomy {
  id: string;
  name: string;
  slug: string;
}

export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
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
  _count?: { comments: number };
  comments?: PublicComment[];
}

export interface PublicComment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
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
