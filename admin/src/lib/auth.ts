// Token va foydalanuvchini brauzer localStorage'da saqlash uchun yordamchilar.
// (Soddaroq yondashuv. Yuqori xavfsizlik kerak bo'lsa httpOnly cookie'ga o'tish mumkin.)

import type { User } from "./types";

const TOKEN_KEY = "ignite_token";
const USER_KEY = "ignite_user";

export function saveAuth(token: string, user: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn(): boolean {
  return Boolean(getToken());
}
