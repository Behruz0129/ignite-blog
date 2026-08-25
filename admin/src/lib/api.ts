// API CLIENT
// ----------
// fetch ustiga yupqa qatlam. Har bir so'rovga avtomatik JWT token qo'shadi
// va xatolarni bir xil ko'rinishda qaytaradi.

import { getToken, getRefreshToken, saveAuth, clearAuth } from "./auth";
import type { ApiResponse } from "./types";
import { API_BASE_URL as BASE_URL } from "./api-url";

interface RequestOptions {
  method?: string;
  body?: unknown;
  // FormData (fayl yuklash) bo'lsa true
  isFormData?: boolean;
}

/**
 * TOKENNI YANGILASH
 * -----------------
 * Access token muddati tugaganda backend 401 beradi. Avval saqlangan refresh
 * token bilan yangi juftlik olishga urinamiz — admin maqola yozayotganda
 * to'satdan login sahifasiga otilmasligi uchun. Faqat u ham ishlamasa
 * chiqaramiz.
 *
 * Backend refresh tokenni rotatsiya qiladi (ishlatilgani bekor bo'ladi),
 * shuning uchun bir paytda faqat BITTA refresh ketadi — parallel so'rovlar
 * shu bitta natijani kutadi.
 */
let refreshInFlight: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const json = await res.json();
    if (!json?.data?.token) return false;
    saveAuth(json.data.token, json.data.user, json.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

function refreshOnce(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
  allowRetry = true
): Promise<ApiResponse<T>> {
  const { method = "GET", body, isFormData = false } = options;

  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (body !== undefined) {
    if (isFormData) {
      payload = body as FormData; // Content-Type'ni brauzer o'zi qo'yadi
    } else {
      headers["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: payload,
  });

  // 401 bo'lsa - avval tokenni yangilab, so'rovni bir marta takrorlaymiz.
  // /auth/refresh ning o'zi 401 bersa takrorlamaymiz (cheksiz sikl bo'lardi).
  if (res.status === 401 && allowRetry && path !== "/auth/refresh") {
    if (await refreshOnce()) {
      return request<T>(path, options, false);
    }
    // Refresh ham ishlamadi — sessiya haqiqatan tugagan
    if (typeof window !== "undefined") {
      clearAuth();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
  }

  const json = (await res.json().catch(() => ({}))) as ApiResponse<T>;

  if (!res.ok) {
    const message = json?.message || `Xatolik (${res.status})`;
    throw new Error(message);
  }

  return json;
}

// Query parametrlarni qulay qurish
export function buildQuery(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.append(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", body: formData, isFormData: true }),
};
