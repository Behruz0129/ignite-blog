"use client";

import { PUBLIC_API_URL } from "./api-url";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  provider?: string;
  emailVerified?: boolean;
}

const TOKEN_KEY = "ignite_token";
const REFRESH_KEY = "ignite_refresh";
const USER_KEY = "ignite_user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function saveAuth(token: string, user: AuthUser, refreshToken?: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * TOKENNI YANGILASH
 * -----------------
 * Access token qisqa muddatli. Muddati tugaganda backend 401 qaytaradi —
 * shunda saqlangan refresh token bilan yangi juftlik olamiz va so'rovni
 * bir marta qayta yuboramiz. Foydalanuvchi buni sezmaydi.
 *
 * Nega bitta umumiy promise? Backend refresh tokenni ROTATSIYA qiladi:
 * ishlatilgan token darhol bekor bo'ladi. Agar bir vaqtda ikki so'rov 401
 * olsa va ikkalasi ham refresh qilsa, ikkinchisi allaqachon bekor qilingan
 * token bilan boradi va foydalanuvchi bejiz tizimdan chiqib ketadi.
 * Shuning uchun bir paytda faqat bitta refresh ishlaydi, qolganlari uni
 * kutadi.
 */
let refreshInFlight: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${PUBLIC_API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
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

async function authFetch<T>(
  path: string,
  options: RequestInit = {},
  allowRetry = true
): Promise<{ ok: boolean; data?: T; message?: string }> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = getStoredToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${PUBLIC_API_URL}${path}`, { ...options, headers });

  // Token eskirgan bo'lsa — yangilab, so'rovni BIR marta takrorlaymiz.
  // /auth/refresh ning o'zi 401 bersa takrorlamaymiz (cheksiz sikl bo'lardi).
  if (res.status === 401 && allowRetry && path !== "/auth/refresh") {
    if (await refreshOnce()) {
      return authFetch<T>(path, options, false);
    }
    // Refresh ham ishlamadi — sessiya haqiqatan tugagan
    clearAuth();
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, message: json?.message || "Xatolik" };
  }
  return { ok: true, data: json.data, message: json.message };
}

export async function login(email: string, password: string) {
  const res = await authFetch<{
    token: string;
    refreshToken: string;
    user: AuthUser;
  }>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok || !res.data) throw new Error(res.message || "Kirish xatosi");
  saveAuth(res.data.token, res.data.user, res.data.refreshToken);
  return res.data.user;
}

/**
 * OAuth'dan qaytgan bir martalik kodni tokenlarga almashtiradi.
 *
 * Ilgari tokenlar to'g'ridan-to'g'ri redirect URL'ida kelardi va brauzer
 * tarixida qolardi; endi URL'da faqat 60 soniya yashaydigan kod bo'ladi.
 */
export async function exchangeOAuthCode(code: string) {
  const res = await authFetch<{
    token: string;
    refreshToken: string;
    user: AuthUser;
  }>("/auth/exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok || !res.data) throw new Error(res.message || "Kirish yakunlanmadi");
  saveAuth(res.data.token, res.data.user, res.data.refreshToken);
  return res.data.user;
}

export async function register(name: string, email: string, password: string) {
  const res = await authFetch<{ message: string; email: string }>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error(res.message || "Ro'yxatdan o'tish xatosi");
  return res.message || res.data?.message || "Email tasdiqlash xabari yuborildi";
}

export async function verifyEmail(token: string) {
  const res = await authFetch<{
    token: string;
    refreshToken: string;
    user: AuthUser;
  }>("/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!res.ok || !res.data) throw new Error(res.message || "Tasdiqlash xatosi");
  saveAuth(res.data.token, res.data.user, res.data.refreshToken);
  return res.data.user;
}

export async function resendVerification(email: string) {
  const res = await authFetch<{ message: string }>("/auth/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(res.message || "Xatolik");
  return res.message || res.data?.message || "Yuborildi";
}

export async function forgotPassword(email: string) {
  const res = await authFetch<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(res.message || "Xatolik");
  return res.message || res.data?.message || "Yuborildi";
}

export async function resetPassword(token: string, password: string) {
  const res = await authFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  if (!res.ok) throw new Error(res.message || "Xatolik");
  return res.message || res.data?.message || "Parol yangilandi";
}

export async function telegramLogin(user: Record<string, unknown>) {
  const res = await authFetch<{
    token: string;
    refreshToken: string;
    user: AuthUser;
  }>("/auth/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!res.ok || !res.data) throw new Error(res.message || "Telegram kirish xatosi");
  saveAuth(res.data.token, res.data.user, res.data.refreshToken);
  return res.data.user;
}

export async function logout() {
  const refreshToken = getStoredRefreshToken();
  await authFetch("/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  clearAuth();
}

export async function fetchMe(): Promise<AuthUser | null> {
  const res = await authFetch<AuthUser>("/auth/me");
  if (!res.ok || !res.data) return null;
  const token = getStoredToken();
  if (token) saveAuth(token, res.data, getStoredRefreshToken() || undefined);
  return res.data;
}

export async function authPost<T>(path: string, body: unknown): Promise<T> {
  const res = await authFetch<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.data) throw new Error(res.message || "Xatolik");
  return res.data;
}
