// API CLIENT (asosan server komponentlar uchun)
// ---------------------------------------------
// Ma'lumotlarni backend'dan olib keladi. SEO uchun sahifalar serverda
// render qilinadi (SSR/ISR). "revalidate" yordamida ma'lumot ma'lum
// vaqtdan keyin yangilanadi (masalan 60 soniya) - bu tezlik va yangilikni
// muvozanatlaydi (minglab tashrifchiga bardosh berish uchun).

import type {
  ApiResponse,
  ContentItem,
  ContentType,
  PaginationMeta,
} from "./types";
import { PUBLIC_API_URL as BASE_URL, PUBLIC_API_URL } from "./api-url";

export { PUBLIC_API_URL };

const REVALIDATE_SECONDS = 60;

async function apiGet<T>(path: string): Promise<ApiResponse<T> | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as ApiResponse<T>;
  } catch {
    // Backend "uyquda" bo'lsa yoki tarmoq xatosi bo'lsa - sahifa qulamasin
    return null;
  }
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  sort?: string;
  order?: "asc" | "desc";
}

function buildQuery(params: ListParams): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.append(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// Kontent ro'yxati (news/guides/opinions)
export async function getList(
  type: ContentType,
  params: ListParams = {}
): Promise<{ items: ContentItem[]; meta: PaginationMeta | null }> {
  const res = await apiGet<ContentItem[]>(`/${type}${buildQuery(params)}`);
  return {
    items: res?.data ?? [],
    meta: res?.meta ?? null,
  };
}

// Bitta kontent (slug bo'yicha)
export async function getBySlug(
  type: ContentType,
  slug: string
): Promise<ContentItem | null> {
  const res = await apiGet<ContentItem>(`/${type}/${slug}`);
  return res?.data ?? null;
}

// Kategoriyalar (footer / navigatsiya uchun)
export async function getCategories() {
  const res = await apiGet<{ id: string; name: string; slug: string }[]>(
    "/categories"
  );
  return res?.data ?? [];
}
