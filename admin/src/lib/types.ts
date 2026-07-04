// Backend qaytaradigan ma'lumotlar tiplari

export type Role = "SUPER_ADMIN" | "ADMIN" | "USER";
export type AuthProvider = "LOCAL" | "GOOGLE" | "DISCORD";
export type ContentStatus = "DRAFT" | "PUBLISHED";
export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type CommentStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Taxonomy {
  id: string;
  name: string;
  slug: string;
  _count?: { news: number; guides: number; opinions: number };
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
  author?: { id: string; name: string; email: string } | null;
  _count?: { comments: number };
}

export interface Comment {
  id: string;
  authorName?: string | null;
  authorEmail?: string | null;
  content: string;
  status: CommentStatus;
  createdAt: string;
  user?: { id: string; name: string; avatar?: string | null } | null;
  news?: { id: string; title: string; slug: string } | null;
  guide?: { id: string; title: string; slug: string } | null;
  opinion?: { id: string; title: string; slug: string } | null;
}

export interface Media {
  id: string;
  publicId: string;
  url: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  provider?: AuthProvider;
  createdAt?: string;
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
  errors?: { field: string; message: string }[];
}

export interface DashboardStats {
  counts: {
    news: { total: number; published: number };
    guides: { total: number; published: number };
    opinions: { total: number; published: number };
    comments: { total: number; pending: number };
    categories: number;
    tags: number;
    media: number;
  };
  recentComments: Comment[];
}
